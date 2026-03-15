import {
  extractDeterministicAmount,
  extractDeterministicCurrency,
  extractDeterministicDate,
  extractDeterministicTitle,
} from "./heuristics";
import {
  AMBIGUOUS_MERCHANTS,
  AssistantRule,
  INDIA_ASSISTANT_RULES,
  INCOME_SIGNAL_KEYWORDS,
} from "./rulesCatalog";
import { ParsedExpense, RuleHit, RuleLockContext, RuleParseResult } from "./types";

const RULE_CONFIDENCE = {
  merchant: 0.95,
  keyword: 0.9,
  threshold: 0.9,
} as const;

const MATCH_PRIORITY: Record<RuleHit["matchType"], number> = {
  exact_merchant: 3,
  alias_merchant: 2,
  keyword_phrase: 1,
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeRuleToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const matchExactPhrase = (haystack: string, needle: string) => {
  const normalizedNeedle = normalizeRuleToken(needle);
  if (!normalizedNeedle) return false;
  const exact = new RegExp(`(?:^|\\s)${escapeRegExp(normalizedNeedle)}(?:\\s|$)`, "i");
  return exact.test(haystack);
};

const normalizeTextForRuleMatching = (input: string) => {
  const lower = input.toLowerCase();

  const withoutNoiseTokens = lower.replace(
    /\b(?:upi|imps|neft|rtgs|vpa|utr|txn|txnid|ref|reference|p2a|p2m|bank|transfer|trf|debit|dr|cr|collect|ltd|limited|pvt|private|axis|hdfc|icici|sbi|kotak|idfc|yesbank)\b/g,
    " "
  );

  return withoutNoiseTokens
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const hasIncomeSignal = (normalizedText: string) =>
  INCOME_SIGNAL_KEYWORDS.some((keyword) => matchExactPhrase(normalizedText, keyword));

const pushMatch = (
  matches: RuleHit[],
  rule: AssistantRule,
  matchType: RuleHit["matchType"],
  matchedToken: string
) => {
  const confidence =
    matchType === "keyword_phrase"
      ? RULE_CONFIDENCE.keyword
      : RULE_CONFIDENCE.merchant;

  matches.push({
    ruleId: rule.id,
    type: rule.type,
    category: rule.category,
    confidence,
    matchedToken,
    matchType,
  });
};

const isAmbiguousToken = (token: string) =>
  AMBIGUOUS_MERCHANTS.includes(normalizeRuleToken(token));

const collectRuleMatches = (normalizedText: string) => {
  const matches: RuleHit[] = [];

  INDIA_ASSISTANT_RULES.forEach((rule) => {
    const merchantTokens = rule.merchantTokens || [];
    merchantTokens.forEach((token) => {
      if (isAmbiguousToken(token)) return;
      if (matchExactPhrase(normalizedText, token)) {
        pushMatch(matches, rule, "exact_merchant", token);
      }
    });

    const merchantAliases = rule.merchantAliases || [];
    merchantAliases.forEach((alias) => {
      if (isAmbiguousToken(alias)) return;
      const normalizedAlias = normalizeRuleToken(alias);
      if (normalizedAlias && normalizedText.includes(normalizedAlias)) {
        pushMatch(matches, rule, "alias_merchant", alias);
      }
    });

    const keywordPhrases = rule.keywordPhrases || [];
    keywordPhrases.forEach((keyword) => {
      if (matchExactPhrase(normalizedText, keyword)) {
        pushMatch(matches, rule, "keyword_phrase", keyword);
      }
    });
  });

  return matches;
};

const compareMatches = (left: RuleHit, right: RuleHit) => {
  const priorityDelta = MATCH_PRIORITY[right.matchType] - MATCH_PRIORITY[left.matchType];
  if (priorityDelta !== 0) return priorityDelta;

  const confidenceDelta = right.confidence - left.confidence;
  if (confidenceDelta !== 0) return confidenceDelta;

  return right.matchedToken.length - left.matchedToken.length;
};

const chooseBestMatch = (normalizedText: string, matches: RuleHit[]) => {
  if (!matches.length) return undefined;

  const incomeSignal = hasIncomeSignal(normalizedText);
  const incomeMatches = matches.filter((match) => match.type === "income");
  const candidatePool =
    incomeSignal && incomeMatches.length ? incomeMatches : matches;

  return [...candidatePool].sort(compareMatches)[0];
};

const isLikelyMultiEntryMessage = (input: string, normalizedText: string) => {
  if (
    /\b(?:another|separate expense|separate income|new expense|new income)\b/i.test(
      normalizedText
    )
  ) {
    return true;
  }

  const connectorPresent = /(?:,|;|\band\b|\bplus\b|\balso\b)/i.test(input);
  const numericTokens = input.match(/\b\d[\d,]*(?:\.\d{1,2})?\b/g) || [];
  if (connectorPresent && numericTokens.length >= 2) {
    return true;
  }

  return false;
};

const collectMissing = (draft: ParsedExpense) => {
  const missing: string[] = [];

  if (!draft.type) missing.push("type");
  if (!draft.category) missing.push("category");
  if (draft.amount === undefined || draft.amount === null) missing.push("amount");
  if (!draft.date) missing.push("date");
  if (!draft.title?.trim()) missing.push("title");
  if (!draft.currency) missing.push("currency");

  return missing;
};

const toLockContext = (hit: RuleHit): RuleLockContext => ({
  type: hit.type,
  category: hit.category,
  ruleId: hit.ruleId,
  matchedToken: hit.matchedToken,
  confidence: hit.confidence,
});

export const parseWithRulesFirst = (payload: {
  text: string;
  defaultCurrency: string;
}): RuleParseResult => {
  const parsedText = typeof payload.text === "string" ? payload.text : "";
  const normalizedText = normalizeTextForRuleMatching(parsedText);
  const isMultiEntry = isLikelyMultiEntryMessage(parsedText, normalizedText);

  if (!normalizedText) {
    return {
      shouldSkipAI: false,
      missing: [],
      isMultiEntry,
    };
  }

  const matches = collectRuleMatches(normalizedText);
  const hit = chooseBestMatch(normalizedText, matches);

  if (!hit) {
    return {
      shouldSkipAI: false,
      missing: [],
      isMultiEntry,
    };
  }

  const parsedPartial: ParsedExpense = {
    type: hit.type,
    category: hit.category,
    amount: extractDeterministicAmount(parsedText),
    date: extractDeterministicDate(parsedText),
    title: extractDeterministicTitle(parsedText, hit.type),
    currency: extractDeterministicCurrency(parsedText, payload.defaultCurrency),
    description: parsedText || "Generated from your message.",
    tag: hit.category.toLowerCase(),
  };
  const missing = collectMissing(parsedPartial);
  const shouldSkipAI =
    hit.confidence >= RULE_CONFIDENCE.threshold &&
    !isMultiEntry &&
    missing.length === 0;

  return {
    hit,
    lock: isMultiEntry ? undefined : toLockContext(hit),
    parsedPartial,
    shouldSkipAI,
    missing,
    isMultiEntry,
  };
};
