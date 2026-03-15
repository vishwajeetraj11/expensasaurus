export type ParsedExpense = {
  type?: "expense" | "income";
  amount?: number;
  currency?: string;
  date?: string;
  category?: string;
  title?: string;
  description?: string;
  tag?: string;
};

export type RuleMatchType = "exact_merchant" | "alias_merchant" | "keyword_phrase";

export type RuleHit = {
  ruleId: string;
  type: "expense" | "income";
  category: string;
  confidence: number;
  matchedToken: string;
  matchType: RuleMatchType;
};

export type RuleLockContext = {
  type: "expense" | "income";
  category: string;
  ruleId: string;
  matchedToken: string;
  confidence: number;
};

export type RuleParseResult = {
  hit?: RuleHit;
  lock?: RuleLockContext;
  parsedPartial?: ParsedExpense;
  shouldSkipAI: boolean;
  missing: string[];
  isMultiEntry: boolean;
};

export type AssistantResponse = {
  reply: string;
  parsed?: ParsedExpense;
  items?: ParsedExpense[];
  missing?: string[];
};

export type ContextMessage = {
  role: "user" | "assistant";
  text: string;
};

export type StreamEvent = {
  type: "reply_delta" | "draft" | "done" | "error" | "final";
  delta?: string;
  reply?: string;
  parsed?: ParsedExpense;
  items?: ParsedExpense[];
  missing?: string[];
  message?: string;
};

export type AuthenticatedUser = {
  userId: string;
  email: string;
  preferredCurrency?: string;
};

export type RateLimitEntry = {
  count: number;
  resetAt: number;
};
