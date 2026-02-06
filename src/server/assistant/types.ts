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
};

export type RateLimitEntry = {
  count: number;
  resetAt: number;
};
