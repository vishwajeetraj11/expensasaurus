import { AssistantResponse } from "./types";

const EXPENSE_CATEGORY_KEYWORDS: Record<string, string> = {
  coffee: "Food",
  lunch: "Food",
  dinner: "Food",
  grocery: "Food",
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

const toIsoDate = (value: Date) => value.toISOString().split("T")[0];

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

const guessCategory = (text: string, type: "expense" | "income") => {
  const lower = text.toLowerCase();
  const keywordMap =
    type === "income" ? INCOME_CATEGORY_KEYWORDS : EXPENSE_CATEGORY_KEYWORDS;
  for (const keyword of Object.keys(keywordMap)) {
    if (lower.includes(keyword)) {
      return keywordMap[keyword];
    }
  }
  return "Other";
};

const guessCurrency = (text: string) => {
  for (const symbol of Object.keys(SYMBOL_TO_CURRENCY)) {
    if (text.includes(symbol)) {
      return SYMBOL_TO_CURRENCY[symbol];
    }
  }
  return "INR";
};

const guessAmount = (text: string) => {
  const explicit = text.match(
    /(?:spent|pay|paid|bought|cost|for)\s*(?:[$€£₹])?\s*(\d+(?:\.\d{1,2})?)/i
  );
  if (explicit?.[1]) return Number(explicit[1]);

  const generic = text.match(/(?:[$€£₹]\s*)?(\d+(?:\.\d{1,2})?)/);
  if (generic?.[1]) return Number(generic[1]);

  return undefined;
};

const guessDate = (text: string) => {
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
    const month = Number(slashMatch[1]) - 1;
    const day = Number(slashMatch[2]);
    const year = Number(
      slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3]
    );
    const date = new Date(year, month, day);
    return toIsoDate(date);
  }

  return toIsoDate(today);
};

const guessTitle = (text: string, type: "expense" | "income") => {
  const match = text.match(/(?:for|on)\s+([a-zA-Z0-9\s]+)$/);
  if (match?.[1]) {
    return match[1].trim().split(/\s+/).slice(0, 4).join(" ");
  }
  return type === "income" ? "Income" : "Expense";
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

export const buildFallbackResponse = (text: string): AssistantResponse => {
  const parsedText = typeof text === "string" ? text : "";
  const type = parsedText ? guessType(parsedText) : "expense";
  const amount = parsedText ? guessAmount(parsedText) : undefined;
  const currency = parsedText ? guessCurrency(parsedText) : "INR";
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
