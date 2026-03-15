export type SplitwiseUserProfile = {
  id?: number | string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  picture?: {
    medium?: string | null;
  } | null;
};

export type SplitwiseUserShare = {
  user?: SplitwiseUserProfile | null;
  user_id?: number | string | null;
  paid_share?: number | string | null;
  owed_share?: number | string | null;
  net_balance?: number | string | null;
};

export type SplitwiseExpense = {
  id?: number | string | null;
  description?: string | null;
  cost?: number | string | null;
  currency_code?: string | null;
  date?: string | null;
  created_at?: string | null;
  created_by?: SplitwiseUserProfile | null;
  category?: {
    id?: number | string | null;
    name?: string | null;
  } | null;
  users?: SplitwiseUserShare[] | null;
  [key: string]: unknown;
};

export type SplitwisePayload = {
  expenses: SplitwiseExpense[];
};

export type SplitwiseNetDirection =
  | "positive"
  | "negative"
  | "settled"
  | "not_involving_me";

export type SplitwiseCurrencyTotal = {
  currencyCode: string;
  total: number;
};

export type SplitwiseParticipantOption = {
  userId: string;
  displayName: string;
  occurrenceCount: number;
};

export type SplitwiseNormalizedRow = {
  splitwiseExpenseId: string;
  description: string;
  date: string | null;
  sortTimestamp: number;
  fullCost: number | null;
  currencyCode: string;
  splitwiseCategory: string;
  myPaidShare: number | null;
  myOwedShare: number | null;
  myNetBalance: number | null;
  netDirection: SplitwiseNetDirection;
  counterparties: string[];
  createdByName: string;
  involvesMe: boolean;
  isValid: boolean;
  validationErrors: string[];
  rawExpense: SplitwiseExpense;
};

export type SplitwiseSummary = {
  totalRowsParsed: number;
  rowsInvolvingMe: number;
  settledCount: number;
  notInvolvingMeCount: number;
  invalidRowCount: number;
  fullCostTotals: SplitwiseCurrencyTotal[];
  positiveNetTotals: SplitwiseCurrencyTotal[];
  negativeNetTotals: SplitwiseCurrencyTotal[];
};

export type SplitwiseAnalysisResult = {
  viewerUserId: string;
  hasViewerSelection: boolean;
  participants: SplitwiseParticipantOption[];
  rows: SplitwiseNormalizedRow[];
  summary: SplitwiseSummary;
};

export type SplitwiseFilterValue =
  | "all"
  | "positive"
  | "negative"
  | "settled"
  | "not_involving_me";

export type SplitwiseCurrentUser = {
  id: string;
  displayName: string;
  email?: string | null;
};

export type SplitwiseApiSyncResponse = {
  source: "splitwise_api";
  fetchedAt: string;
  expensesCount: number;
  user: SplitwiseCurrentUser;
  payload: SplitwisePayload;
};
