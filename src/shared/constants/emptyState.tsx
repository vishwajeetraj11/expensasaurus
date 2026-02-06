import { ROUTES } from "./routes";

export const noMoreExpensesInCategory = {
    title: 'No More Expenses in this Category',
    description: 'You have explored all the expenses in this category. Start adding new expenses to continue tracking your spending.',
    buttonText: 'Add New Expense',
    buttonLink: ROUTES.EXPENSE_CREATE,
}

export const noBudgetsCreated = {
    title: 'No Budgets Created',
    description: 'Start by creating a budget to track your expenses and manage your finances effectively.',
    buttonText: 'Create New Budget',
    buttonLink: ROUTES.BUDGET_CREATE,
}
