import { categories } from "../constants/categories"
import { Transaction } from "../types/transaction"

export const calcExpenseStats = (expenses: Transaction[]) => {
    const expensesStats = {
        min: Infinity,
        max: 0,
        avg: 0,
        sum: 0
    }
    expenses.forEach((expense) => {
        expensesStats.min = Math.min(expensesStats.min, expense.amount)
        expensesStats.max = Math.max(expensesStats.max, expense.amount)
        expensesStats.sum += expense.amount
    })
    expensesStats.avg = expensesStats.sum / expenses.length
    if (expensesStats.min === Infinity) {
        expensesStats.min = 0
    }
    return expensesStats
}

export type TransactionChange = 'moderateIncrease' | 'moderateDecrease';

export function calculateTransactionChange(previousMonthTotal: number, currentMonthTotal: number): { percentage: number, transactionChange: TransactionChange } {
    const change = currentMonthTotal - previousMonthTotal;
    let percentage = (change / previousMonthTotal) * 100;

    const transactionChange: TransactionChange = change > 0 ? 'moderateIncrease' : 'moderateDecrease';

    if (percentage === Infinity) {
        percentage = 0;
    }

    return {
        percentage,
        transactionChange,
    };
}

export function calculateTotalExpensesByCategory(expenses: Transaction[]): Record<string, { amount: number, transactionsCount: number, percentage: number, currency: string }> {
    const totalExpensesByCategory: Record<string, { amount: number, transactionsCount: number, percentage: number, currency: string }> = {};
    const totalExpense = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    for (const expense of expenses) {
        const { amount, category } = expense;
        if (!totalExpensesByCategory[category]) {
            totalExpensesByCategory[category] = { amount: 0, transactionsCount: 0, percentage: 0, currency: expenses[0].currency }
        }
        totalExpensesByCategory[category].amount += amount;
        totalExpensesByCategory[category].transactionsCount += 1;
    }

    for (const category in totalExpensesByCategory) {
        const { amount } = totalExpensesByCategory[category];
        totalExpensesByCategory[category].percentage = (amount / totalExpense) * 100;
        totalExpensesByCategory[category].currency = expenses[0].currency;
    }

    return totalExpensesByCategory;
}

export function calcTotalExpByCategoryBuget(expenses: Transaction[]): Record<string, { amount: number, transactionsCount: number, percentage: number, currency: string }> {
    const totalExpensesByCategory: Record<string, { amount: number, transactionsCount: number, percentage: number, currency: string }> = {};
    const totalExpense = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    if (expenses.length) {
        categories.forEach((category) => {
            totalExpensesByCategory[category.key] = { amount: 0, transactionsCount: 0, percentage: 0, currency: expenses[0].currency, }
        })
    }
    for (const expense of expenses) {
        const { amount, category } = expense;
        if (!totalExpensesByCategory[category]) {
            totalExpensesByCategory[category] = { amount: 0, transactionsCount: 0, percentage: 0, currency: expenses[0].currency }
        }
        totalExpensesByCategory[category].amount += amount;
        totalExpensesByCategory[category].transactionsCount += 1;
    }

    for (const category in totalExpensesByCategory) {
        const { amount } = totalExpensesByCategory[category];
        totalExpensesByCategory[category].percentage = (amount / totalExpense) * 100;
        totalExpensesByCategory[category].currency = expenses[0].currency;
    }

    return totalExpensesByCategory;
}


// export function groupExpensesByCategory(expenses: Transaction[]): Record<string, { expenses: Transaction }> {
//     const totalExpensesByCategory: Record<string, { amount: number, transactionsCount: number }> = {};

//     for (const expense of expenses) {
//         const { amount, category } = expense;
//         if (!totalExpensesByCategory[category]) {
//             totalExpensesByCategory[category] = { amount: 0, transactionsCount: 0 }
//         }
//         totalExpensesByCategory[category].amount += amount;
//         totalExpensesByCategory[category].transactionsCount += 1;
//     }

//     return totalExpensesByCategory;
// }


export interface CategoryData {
    totalExpenses: number;
    percentageChange: number;
    absolutePrevValue: number;
}

export function calculateTotalExpensesWithPercentageChange(expenses: Transaction[], previousMonthTotals: Record<string, { amount: number, transactionsCount: number, percentage: number }>): Record<string, CategoryData> {
    const totalExpensesByCategory: Record<string, CategoryData> = {};

    for (const expense of expenses) {
        const { amount, category } = expense;

        if (!totalExpensesByCategory[category]) {
            totalExpensesByCategory[category] = {
                totalExpenses: 0,
                percentageChange: 0,
                absolutePrevValue: 0
            };
        }

        totalExpensesByCategory[category].totalExpenses += amount;

        if (previousMonthTotals[category]) {
            const previousMonthTotal = previousMonthTotals[category].amount;
            const currentMonthTotal = totalExpensesByCategory[category].totalExpenses;
            const change = currentMonthTotal - previousMonthTotal;
            const percentageChange = (change / previousMonthTotal) * 100;
            totalExpensesByCategory[category].percentageChange = percentageChange;
            totalExpensesByCategory[category].absolutePrevValue = previousMonthTotal;
        } else {
            // TODO: if there was no expense in earlier month in this category and now there is, then the percentage change should be 100% ?? correct behaviour?
            totalExpensesByCategory[category].percentageChange = totalExpensesByCategory[category].totalExpenses;
        }
    }

    return totalExpensesByCategory;
}
