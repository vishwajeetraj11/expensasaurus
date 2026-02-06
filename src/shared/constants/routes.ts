export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  ASSISTANT: "/assistant",
  EXPENSES: "/expenses",
  EXPENSE_CREATE: "/expenses/create",
  EXPENSE_DETAIL: "/expenses/[id]",
  EXPENSE_EDIT: "/expenses/[id]/edit",
  INCOMES: "/incomes",
  INCOME_CREATE: "/incomes/create",
  INCOME_DETAIL: "/incomes/[id]",
  INCOME_EDIT: "/incomes/[id]/edit",
  BUDGETS: "/budgets",
  BUDGET_CREATE: "/budgets/create",
  BUDGET_DETAIL: "/budgets/[id]",
  BUDGET_EDIT: "/budgets/[id]/edit",
  CATEGORY: "/category",
  CALENDAR: "/calender",
} as const;

export const API_ROUTES = {
  ASSISTANT: "/api/assistant",
} as const;

export const LANDING_SECTIONS = {
  HOW_IT_WORKS: "#how-it-works",
  ASSISTANT: "#assistant",
  BUDGET: "#budget",
} as const;

export const AUTHENTICATED_ROUTES: string[] = [
  ROUTES.CALENDAR,
  ROUTES.CATEGORY,
  ROUTES.EXPENSES,
  ROUTES.INCOMES,
  ROUTES.BUDGETS,
  ROUTES.INCOME_DETAIL,
  ROUTES.EXPENSE_DETAIL,
  ROUTES.BUDGET_DETAIL,
  ROUTES.INCOME_CREATE,
  ROUTES.EXPENSE_CREATE,
  ROUTES.BUDGET_CREATE,
  ROUTES.INCOME_EDIT,
  ROUTES.EXPENSE_EDIT,
  ROUTES.BUDGET_EDIT,
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.ASSISTANT,
];

export const PUBLIC_ROUTES: string[] = [
  ROUTES.HOME,
  ROUTES.SIGNUP,
  ROUTES.LOGIN,
];

export const routeBuilders = {
  expenseDetail: (id: string) => `${ROUTES.EXPENSES}/${id}`,
  expenseEdit: (id: string) => `${ROUTES.EXPENSES}/${id}/edit`,
  expensesByCategory: (category: string) =>
    `${ROUTES.EXPENSES}?category=${encodeURIComponent(category)}`,
  incomeDetail: (id: string) => `${ROUTES.INCOMES}/${id}`,
  incomeEdit: (id: string) => `${ROUTES.INCOMES}/${id}/edit`,
  budgetDetail: (id: string) => `${ROUTES.BUDGETS}/${id}`,
  budgetEdit: (id: string) => `${ROUTES.BUDGETS}/${id}/edit`,
};
