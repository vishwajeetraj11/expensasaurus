import { Color } from "@tremor/react";

export const dashboardStatColors: { [key: string]: Color } = {
  increase: "emerald",
  moderateIncrease: "emerald",
  unchanged: "rose",
  moderateDecrease: "rose",
  decrease: "rose",
};

export const regex = {
  // number: /^[0-9\b]+$/,
  // number: /^\d+(\.\d{1,2})?$/,
  // number: /^(?!$)\d{0,3}(,\d{3})*(\.\d+)?$/,
  number: /^(?!$)(\d{0,12}|\d{1,12}\.\d{1,2})$/,
  // /^(?!$)\d{0,3}(,\d{3})*(\.\d*)?$/
  // amount: /^\d+(\.\d{1,2})?$/,
  numberAndDot: /^[0-9.]+$/,
};

export const ENVS = {
  COLLECTIONS: {
    EXPENSES: process.env.NEXT_PUBLIC_EXPENSES_COLLECTION_ID as string,
    INCOMES: process.env.NEXT_PUBLIC_INCOMES_COLLECTION_ID as string,
    BUDGETS: process.env.NEXT_PUBLIC_BUDGETS_COLLECTION_ID as string,
  },
  DB_ID: process.env.NEXT_PUBLIC_DATABASE_ID as string,
  PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string,
  BUCKET_ID: process.env.NEXT_PUBLIC_BUCKET_ID as string,
};

// Define the months of the year in an array
export const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];
