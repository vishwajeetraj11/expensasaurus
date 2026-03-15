import { AssistantResponse, ContextMessage, ParsedExpense } from "./types";

const EXPENSE_CATEGORY_KEYWORDS: Record<string, string> = {
  coffee: "Food",
  lunch: "Food",
  dinner: "Food",
  grocery: "Food",
  restaurant: "Food",
  food: "Food",
  uber: "Transportation",
  taxi: "Transportation",
  bus: "Transportation",
  rent: "Housing",
  mortgage: "Housing",
  netflix: "Entertainment",
  movie: "Entertainment",
  doctor: "Healthcare",
  pharmacy: "Healthcare",
  flight: "Travel",
  hotel: "Travel",
  electricity: "Utilities",
  water: "Utilities",
  internet: "Utilities",
  grooming: "Personal",
  salon: "Personal",
  barber: "Personal",
  spa: "Personal",
  recharge: "Utilities",
};

const INCOME_CATEGORY_KEYWORDS: Record<string, string> = {
  salary: "Salary",
  paycheck: "Salary",
  wage: "Salary",
  bonus: "Salary",
  stipend: "Salary",
  freelance: "Freelance/Contract Work",
  contract: "Freelance/Contract Work",
  consulting: "Freelance/Contract Work",
  investment: "Investments",
  investments: "Investments",
  stock: "Investments",
  stocks: "Investments",
  dividend: "Interest/Dividends",
  interest: "Interest/Dividends",
  rental: "Rental Income",
  "rent received": "Rental Income",
  business: "Business Income",
  commission: "Business Income",
  royalty: "Royalties",
  royalties: "Royalties",
  gift: "Gifts/Inheritance",
  inheritance: "Gifts/Inheritance",
  pension: "Pension/Social Security",
  "social security": "Pension/Social Security",
  "side hustle": "Side Hustle/Part-time Work",
  "part-time": "Side Hustle/Part-time Work",
};

export const EXPENSE_CATEGORY_OPTIONS = [
  "Food",
  "Entertainment",
  "Housing",
  "Transportation",
  "Healthcare",
  "Travel",
  "Education",
  "Personal",
  "Insurance",
  "Savings",
  "Investments",
  "Utilities",
  "Business",
  "Other",
];

export const INCOME_CATEGORY_OPTIONS = [
  "Salary",
  "Freelance/Contract Work",
  "Investments",
  "Rental Income",
  "Business Income",
  "Interest/Dividends",
  "Pension/Social Security",
  "Gifts/Inheritance",
  "Royalties",
  "Side Hustle/Part-time Work",
  "Other",
];

const INCOME_TYPE_KEYWORDS = [
  "salary",
  "income",
  "paycheck",
  "wage",
  "bonus",
  "stipend",
  "dividend",
  "interest",
  "rental",
  "rent received",
  "freelance",
  "contract",
  "commission",
  "royalty",
  "gift",
  "inheritance",
  "pension",
  "social security",
  "side hustle",
  "part-time",
  "credited",
  "received",
  "deposit",
  "payout",
];

const EXPENSE_TYPE_KEYWORDS = [
  "spent",
  "paid",
  "bought",
  "cost",
  "purchase",
  "charged",
  "bill",
  "invoice",
  "fee",
];

const SYMBOL_TO_CURRENCY: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "₹": "INR",
};

const CURRENCY_TEXT_TO_CODE: Record<string, string> = {
  inr: "INR",
  rs: "INR",
  rupee: "INR",
  rupees: "INR",
  usd: "USD",
  dollar: "USD",
  dollars: "USD",
  eur: "EUR",
  euro: "EUR",
  euros: "EUR",
  gbp: "GBP",
  pound: "GBP",
  pounds: "GBP",
};
const CURRENCY_TOKEN_PATTERN =
  "[$€£₹]|(?:\\b(?:inr|usd|eur|gbp|rs\\.?|rupee|rupees|dollar|dollars|euro|euros|pound|pounds)\\b)";

const MONTH_TO_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const MONTH_WORD_PATTERN =
  "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
const MONTH_WORD_REGEX = new RegExp(`\\b(?:${MONTH_WORD_PATTERN})\\b`, "i");
const STRUCTURED_DRAFT_CONTEXT_MARKER = "Structured draft context:";
const UPDATE_HINT_REGEX =
  /\b(change|update|correct|wrong|fix|instead|actually|edit|modify|should be|it was|date|amount|category|title|description|tag)\b/i;
const NEW_ENTRY_HINT_REGEX =
  /\b(another|new expense|new income|separate expense|separate income)\b/i;

const toIsoDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeCurrencyToken = (token: string) =>
  token.toLowerCase().replace(/\./g, "");

export const normalizeCurrencyCode = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;

  const symbolMapped = SYMBOL_TO_CURRENCY[trimmed];
  if (symbolMapped) return symbolMapped;

  const normalizedToken = normalizeCurrencyToken(trimmed);
  const keywordMapped = CURRENCY_TEXT_TO_CODE[normalizedToken];
  if (keywordMapped) return keywordMapped;

  if (/^[a-z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  return undefined;
};

export const resolveAssistantCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value) || "INR";

export const getMentionedCurrencies = (text: string) => {
  if (!text) return [];

  const seen = new Set<string>();
  const matches = Array.from(text.matchAll(new RegExp(CURRENCY_TOKEN_PATTERN, "gi")));
  matches.forEach((match) => {
    const code = normalizeCurrencyCode(match[0]);
    if (code) seen.add(code);
  });

  return Array.from(seen);
};

export const getFirstDisallowedCurrency = (
  text: string,
  allowedCurrency: string
) => {
  const resolvedAllowedCurrency = resolveAssistantCurrency(allowedCurrency);
  const mentioned = getMentionedCurrencies(text);
  return mentioned.find((code) => code !== resolvedAllowedCurrency) || null;
};

const parseAmountToken = (token?: string) => {
  if (!token) return undefined;
  const numeric = Number(token.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : undefined;
};

const resolveYear = (value: string | undefined, fallbackYear: number) => {
  if (!value) return fallbackYear;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallbackYear;
  if (value.length === 2) return 2000 + numeric;
  return numeric;
};

const buildIsoDateFromParts = (
  year: number,
  monthIndex: number,
  day: number
): string | null => {
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  const candidate = new Date(year, monthIndex, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== monthIndex ||
    candidate.getDate() !== day
  ) {
    return null;
  }
  return toIsoDate(candidate);
};

const isLikelyDateNumber = (text: string, startIndex: number, raw: string) => {
  if (raw.includes(".")) return false;

  const numeric = parseAmountToken(raw);
  if (!numeric) return false;

  const prev = text[startIndex - 1];
  const next = text[startIndex + raw.length];
  if (prev === "/" || next === "/" || prev === "-" || next === "-") {
    return true;
  }

  if (numeric >= 1900 && numeric <= 2100) return true;

  if (numeric <= 31) {
    const windowStart = Math.max(0, startIndex - 16);
    const windowEnd = Math.min(text.length, startIndex + raw.length + 16);
    const context = text.slice(windowStart, windowEnd).toLowerCase();
    if (MONTH_WORD_REGEX.test(context)) return true;
  }

  return false;
};

const guessType = (text: string): "expense" | "income" => {
  const lower = text.toLowerCase();
  if (INCOME_TYPE_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return "income";
  }
  if (EXPENSE_TYPE_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return "expense";
  }
  return "expense";
};

const extractCategory = (text: string, type: "expense" | "income") => {
  const lower = text.toLowerCase();
  const keywordMap =
    type === "income" ? INCOME_CATEGORY_KEYWORDS : EXPENSE_CATEGORY_KEYWORDS;
  for (const keyword of Object.keys(keywordMap)) {
    if (lower.includes(keyword)) {
      return keywordMap[keyword];
    }
  }
  return undefined;
};

const guessCategory = (text: string, type: "expense" | "income") =>
  extractCategory(text, type) || "Other";

const extractCurrency = (text: string) => {
  const [first] = getMentionedCurrencies(text);
  return first;
};

const guessCurrency = (text: string, defaultCurrency: string) =>
  extractCurrency(text) || resolveAssistantCurrency(defaultCurrency);

const guessAmount = (text: string) => {
  const explicit = text.match(
    /(?:spent|pay|paid|bought|cost|for)\s*(?:[$€£₹])?\s*(\d+(?:\.\d{1,2})?)/i
  );
  if (explicit?.[1]) return parseAmountToken(explicit[1]);

  const prefixedCurrencyMatches = text.matchAll(
    /(?:[$€£₹]|\b(?:inr|usd|eur|gbp|rs\.?|rupees?|dollars?|euros?|pounds?)\b)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi
  );
  let prefixedCandidate: number | undefined;
  Array.from(prefixedCurrencyMatches).forEach((match) => {
    const parsed = parseAmountToken(match[1]);
    if (parsed !== undefined) prefixedCandidate = parsed;
  });
  if (prefixedCandidate !== undefined) return prefixedCandidate;

  const suffixedCurrencyMatches = text.matchAll(
    /([0-9][0-9,]*(?:\.\d{1,2})?)\s*(?:[$€£₹]|\b(?:inr|usd|eur|gbp|rs\.?|rupees?|dollars?|euros?|pounds?)\b)/gi
  );
  let suffixedCandidate: number | undefined;
  Array.from(suffixedCurrencyMatches).forEach((match) => {
    const parsed = parseAmountToken(match[1]);
    if (parsed !== undefined) suffixedCandidate = parsed;
  });
  if (suffixedCandidate !== undefined) return suffixedCandidate;

  const genericMatches = text.matchAll(/\b\d[\d,]*(?:\.\d{1,2})?\b/g);
  const candidates: Array<{ raw: string; value: number; index: number }> = [];
  Array.from(genericMatches).forEach((match) => {
    const raw = match[0];
    const index = match.index ?? -1;
    const parsed = parseAmountToken(raw);
    if (index === -1 || parsed === undefined) return;
    if (isLikelyDateNumber(text, index, raw)) return;
    candidates.push({ raw, value: parsed, index });
  });

  if (!candidates.length) return undefined;
  const decimals = candidates.filter((candidate) => candidate.raw.includes("."));
  if (decimals.length) return decimals[decimals.length - 1].value;
  return candidates[candidates.length - 1].value;

  return undefined;
};

const extractExplicitDate = (text: string) => {
  const lower = text.toLowerCase();
  const today = new Date();

  if (lower.includes("today")) return toIsoDate(today);
  if (lower.includes("yesterday")) {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return toIsoDate(date);
  }
  if (lower.includes("tomorrow")) {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return toIsoDate(date);
  }

  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch?.[1]) return isoMatch[1];

  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);
    const year = resolveYear(slashMatch[3], today.getFullYear());
    const monthIndex = first > 12 && second <= 12 ? second - 1 : first - 1;
    const day = first > 12 && second <= 12 ? first : second;
    const resolved = buildIsoDateFromParts(year, monthIndex, day);
    if (resolved) return resolved;
  }

  const dayMonthTextMatch = text.match(
    new RegExp(
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:of\\s+)?(${MONTH_WORD_PATTERN})\\s*,?\\s*(\\d{2,4})?\\b`,
      "i"
    )
  );
  if (dayMonthTextMatch) {
    const day = Number(dayMonthTextMatch[1]);
    const monthIndex = MONTH_TO_INDEX[dayMonthTextMatch[2].toLowerCase()];
    const year = resolveYear(dayMonthTextMatch[3], today.getFullYear());
    const resolved = buildIsoDateFromParts(year, monthIndex, day);
    if (resolved) return resolved;
  }

  const monthDayTextMatch = text.match(
    new RegExp(
      `\\b(${MONTH_WORD_PATTERN})\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s*,?\\s*(\\d{2,4})?\\b`,
      "i"
    )
  );
  if (monthDayTextMatch) {
    const monthIndex = MONTH_TO_INDEX[monthDayTextMatch[1].toLowerCase()];
    const day = Number(monthDayTextMatch[2]);
    const year = resolveYear(monthDayTextMatch[3], today.getFullYear());
    const resolved = buildIsoDateFromParts(year, monthIndex, day);
    if (resolved) return resolved;
  }

  const dashMatch = text.match(/\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/);
  if (dashMatch) {
    const first = Number(dashMatch[1]);
    const second = Number(dashMatch[2]);
    const year = resolveYear(dashMatch[3], today.getFullYear());
    const monthIndex = first > 12 && second <= 12 ? second - 1 : first - 1;
    const day = first > 12 && second <= 12 ? first : second;
    const resolved = buildIsoDateFromParts(year, monthIndex, day);
    if (resolved) return resolved;
  }

  return undefined;
};

const guessDate = (text: string) => {
  const explicitDate = extractExplicitDate(text);
  if (explicitDate) return explicitDate;
  const today = new Date();
  return toIsoDate(today);
};

const guessTitle = (text: string, type: "expense" | "income") => {
  const match = text.match(/(?:for|on|at|to)\s+([a-zA-Z0-9\s]+)$/i);
  if (match?.[1]) {
    return match[1].trim().split(/\s+/).slice(0, 4).join(" ");
  }

  const cleaned = text
    .replace(
      new RegExp(`\\b(?:${MONTH_WORD_PATTERN}|today|yesterday|tomorrow)\\b`, "gi"),
      " "
    )
    .replace(
      /\b(?:spent|pay|paid|bought|cost|for|on|at|to|income|expense|credited|received|inr|usd|eur|gbp|rs\.?|rupees?|dollars?|euros?|pounds?)\b/gi,
      " "
    )
    .replace(/[₹$€£]/g, " ")
    .replace(/\b\d[\d,]*(?:\.\d{1,2})?\b/g, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned) {
    return cleaned
      .split(" ")
      .slice(0, 4)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return type === "income" ? "Income" : "Expense";
};

export const extractDeterministicAmount = (text: string) => guessAmount(text);

export const extractDeterministicDate = (text: string) => guessDate(text);

export const extractDeterministicCurrency = (
  text: string,
  defaultCurrency: string
) => guessCurrency(text, defaultCurrency);

export const extractDeterministicTitle = (
  text: string,
  type: "expense" | "income"
) => guessTitle(text, type);

type DraftContext = {
  draft: ParsedExpense;
  missing: string[];
};

const parseStructuredDraftContext = (text: string): DraftContext | null => {
  const markerIndex = text.lastIndexOf(STRUCTURED_DRAFT_CONTEXT_MARKER);
  if (markerIndex === -1) return null;

  const rawContext = text
    .slice(markerIndex + STRUCTURED_DRAFT_CONTEXT_MARKER.length)
    .trim();
  if (!rawContext) return null;

  try {
    const parsed = JSON.parse(rawContext);
    const parsedDraft =
      parsed?.parsed && typeof parsed.parsed === "object"
        ? (parsed.parsed as ParsedExpense)
        : undefined;
    const parsedItems =
      Array.isArray(parsed?.items) && parsed.items.length > 0
        ? parsed.items.filter((item: unknown) => item && typeof item === "object")
        : [];
    const draft = parsedDraft || (parsedItems[parsedItems.length - 1] as ParsedExpense);
    if (!draft || typeof draft !== "object") return null;

    const missing = Array.isArray(parsed?.missing)
      ? parsed.missing.filter((item: unknown): item is string => typeof item === "string")
      : [];

    return { draft, missing };
  } catch (err) {
    return null;
  }
};

const getLatestDraftContext = (messages?: ContextMessage[]) => {
  if (!messages?.length) return null;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "assistant") continue;
    const parsed = parseStructuredDraftContext(message.text);
    if (parsed) return parsed;
  }

  return null;
};

const looksLikeDraftUpdate = (text: string, draftContext: DraftContext | null) => {
  if (!draftContext) return false;
  const lower = text.trim().toLowerCase();
  if (!lower) return false;
  if (NEW_ENTRY_HINT_REGEX.test(lower)) return false;
  if (UPDATE_HINT_REGEX.test(lower)) return true;

  const containsEntryVerb = /\b(spent|paid|bought|received|salary|income|expense)\b/.test(
    lower
  );
  const hasFieldLikeUpdate =
    guessAmount(lower) !== undefined || extractExplicitDate(lower) !== undefined;

  if (hasFieldLikeUpdate && !containsEntryVerb) return true;
  if (!containsEntryVerb && lower.split(/\s+/).length <= 6) return true;
  return false;
};

const buildUpdatedDraftResponse = (
  text: string,
  draftContext: DraftContext,
  defaultCurrency: string
): AssistantResponse => {
  const resolvedCurrency = resolveAssistantCurrency(defaultCurrency);
  const currentDraft = draftContext.draft || {};
  const type = currentDraft.type === "income" ? "income" : "expense";
  const updatedDraft: ParsedExpense = { ...currentDraft };

  const amount = guessAmount(text);
  const explicitDate = extractExplicitDate(text);
  const explicitCurrency = extractCurrency(text);
  const explicitCategory = extractCategory(text, type);
  const explicitTitle = text.match(/\btitle\s*(?:is|to|as|:)?\s*([a-zA-Z0-9\s-]{2,})$/i)?.[1];
  const lower = text.toLowerCase();

  if (amount !== undefined) updatedDraft.amount = amount;
  if (explicitDate) updatedDraft.date = explicitDate;
  if (explicitCurrency) updatedDraft.currency = explicitCurrency;
  if (explicitCategory) {
    updatedDraft.category = explicitCategory;
    updatedDraft.tag = explicitCategory.toLowerCase();
  }
  if (explicitTitle?.trim()) {
    updatedDraft.title = explicitTitle.trim();
  }

  if (!updatedDraft.type) {
    updatedDraft.type = type;
  }
  if (!updatedDraft.currency) {
    updatedDraft.currency = resolvedCurrency;
  }
  if (!updatedDraft.date) {
    updatedDraft.date = guessDate("today");
  }
  if (!updatedDraft.title) {
    updatedDraft.title = type === "income" ? "Income" : "Expense";
  }

  const missingSet = new Set(
    draftContext.missing.filter((field) => typeof field === "string")
  );

  if (updatedDraft.amount === undefined || updatedDraft.amount === null) {
    missingSet.add("amount");
  } else {
    missingSet.delete("amount");
  }

  const mentionedDate = /\bdate\b/i.test(lower);
  if (mentionedDate && !explicitDate) {
    missingSet.add("date");
  }
  if (explicitDate) {
    missingSet.delete("date");
  }

  const mentionedAmount = /\b(amount|amt|price|cost)\b/i.test(lower);
  if (mentionedAmount && amount === undefined) {
    missingSet.add("amount");
  }

  const missing = Array.from(missingSet);
  const reply =
    mentionedDate && !explicitDate
      ? "Got it. Tell me the correct date (for example: Feb 1, 2026) and I will update the draft."
      : missing.length
      ? `I updated what I could. I still need ${missing.join(", ")} to finish this draft.`
      : "Updated the draft. Review and save.";

  return {
    reply,
    parsed: {
      ...updatedDraft,
      description:
        updatedDraft.description || text || "Updated using your follow-up instruction.",
      tag: updatedDraft.tag || updatedDraft.category?.toLowerCase(),
    },
    missing,
  };
};

export const sanitizeBase64 = (value: string) => {
  const marker = "base64,";
  const index = value.indexOf(marker);
  if (index === -1) return value;
  return value.slice(index + marker.length);
};

export const ensureDataUrl = (value: string, mimeType: string) => {
  if (value.startsWith("data:")) return value;
  return `data:${mimeType};base64,${value}`;
};

export const buildFallbackResponse = (
  text: string,
  contextMessages?: ContextMessage[],
  defaultCurrency = "INR"
): AssistantResponse => {
  const resolvedCurrency = resolveAssistantCurrency(defaultCurrency);
  const parsedText = typeof text === "string" ? text : "";
  const latestDraftContext = getLatestDraftContext(contextMessages);

  if (parsedText && looksLikeDraftUpdate(parsedText, latestDraftContext)) {
    return buildUpdatedDraftResponse(
      parsedText,
      latestDraftContext as DraftContext,
      resolvedCurrency
    );
  }

  const type = parsedText ? guessType(parsedText) : "expense";
  const amount = parsedText ? guessAmount(parsedText) : undefined;
  const currency = parsedText
    ? guessCurrency(parsedText, resolvedCurrency)
    : resolvedCurrency;
  const date = parsedText ? guessDate(parsedText) : guessDate("today");
  const category = parsedText ? guessCategory(parsedText, type) : "Other";
  const title = parsedText
    ? guessTitle(parsedText, type)
    : type === "income"
    ? "Income"
    : "Expense";

  const missing: string[] = [];
  if (!amount) missing.push("amount");

  const reply = missing.length
    ? `I need ${missing.join(", ")} to finish this. Add those and I will update the draft.`
    : "Here is a draft based on that. Tell me what to change.";

  return {
    reply,
    parsed: {
      type,
      amount,
      currency,
      date,
      category,
      title,
      description: parsedText || "Generated from your attachment.",
      tag: category?.toLowerCase(),
    },
    missing,
  };
};
