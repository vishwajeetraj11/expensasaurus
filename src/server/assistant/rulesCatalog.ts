import type { ParsedExpense } from "./types";

export type AssistantRule = {
  id: string;
  type: NonNullable<ParsedExpense["type"]>;
  category: string;
  merchantTokens?: string[];
  merchantAliases?: string[];
  keywordPhrases?: string[];
};

// Keep these out of hard merchant matching unless they appear in a stronger phrase.
export const AMBIGUOUS_MERCHANTS = ["amazon", "google pay", "phonepe", "paytm"];

export const INCOME_SIGNAL_KEYWORDS = [
  "salary",
  "credited",
  "payroll",
  "bonus",
  "stipend",
  "paycheck",
  "freelance",
  "consulting",
  "contract",
  "upwork",
  "fiverr",
  "interest",
  "dividend",
  "rent received",
  "rental income",
  "refund",
  "cashback",
];

export const INDIA_ASSISTANT_RULES: AssistantRule[] = [
  {
    id: "expense_food_delivery",
    type: "expense",
    category: "Food",
    merchantTokens: [
      "swiggy",
      "zomato",
      "blinkit",
      "zepto",
      "instamart",
      "bigbasket",
      "dominos",
      "mcdonalds",
      "kfc",
      "starbucks",
    ],
  },
  {
    id: "expense_utilities_saas",
    type: "expense",
    category: "Utilities",
    merchantTokens: [
      "cursor",
      "openai",
      "chatgpt",
      "github",
      "notion",
      "canva",
      "figma",
      "vercel",
      "aws",
      "gcp",
      "cloudflare",
      "digitalocean",
      "jio",
      "airtel",
      "vi",
      "bsnl",
      "act fibernet",
    ],
    merchantAliases: ["amazon web services", "gcp billing", "github copilot"],
  },
  {
    id: "expense_transport_apps",
    type: "expense",
    category: "Transportation",
    merchantTokens: ["ola", "uber", "rapido", "irctc", "redbus"],
  },
  {
    id: "expense_travel_booking",
    type: "expense",
    category: "Travel",
    merchantTokens: [
      "makemytrip",
      "goibibo",
      "yatra",
      "cleartrip",
      "booking",
      "airbnb",
    ],
    merchantAliases: ["booking.com"],
  },
  {
    id: "expense_entertainment_subscriptions",
    type: "expense",
    category: "Entertainment",
    merchantTokens: ["netflix", "hotstar", "spotify", "bookmyshow"],
    merchantAliases: ["prime video", "amazon prime"],
  },
  {
    id: "expense_healthcare_pharmacy",
    type: "expense",
    category: "Healthcare",
    merchantTokens: [
      "1mg",
      "pharmeasy",
      "netmeds",
      "apollo pharmacy",
      "medplus",
    ],
  },
  {
    id: "income_salary",
    type: "income",
    category: "Salary",
    keywordPhrases: [
      "salary",
      "credited",
      "payroll",
      "bonus",
      "stipend",
      "paycheck",
    ],
  },
  {
    id: "income_freelance",
    type: "income",
    category: "Freelance/Contract Work",
    keywordPhrases: [
      "freelance",
      "consulting",
      "contract",
      "upwork",
      "fiverr",
    ],
  },
  {
    id: "income_interest_dividend",
    type: "income",
    category: "Interest/Dividends",
    keywordPhrases: ["interest", "dividend"],
  },
  {
    id: "income_rental",
    type: "income",
    category: "Rental Income",
    keywordPhrases: ["rent received", "rental income"],
  },
  {
    id: "income_other_refund",
    type: "income",
    category: "Other",
    keywordPhrases: ["refund", "cashback"],
  },
];
