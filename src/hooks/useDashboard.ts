import {
    Models, Query
} from 'appwrite';
import { ENVS } from 'expensasaurus/shared/constants/constants';
import { getAllLists } from 'expensasaurus/shared/services/query';
import { useAuthStore } from 'expensasaurus/shared/stores/useAuthStore';
import { DashboardStat, Transaction } from 'expensasaurus/shared/types/transaction';
import { calcExpenseStats, calculateTotalExpensesByCategory, calculateTotalExpensesWithPercentageChange, calculateTransactionChange } from 'expensasaurus/shared/utils/calculation';
import { formatCurrency } from 'expensasaurus/shared/utils/currency';
import { shallow } from 'zustand/shallow';
import useDates from './useDates';

const useDashboard = () => {
    const { endOfEarlierMonth, endOfThisMonth, startOfEarlierMonth, startOfThisMonth } = useDates()

    const { user, userInfo } = useAuthStore((state) => ({ user: state.user, userInfo: state.userInfo }), shallow) as {
        user: Models.Session;
        userInfo: Models.User<Models.Preferences>;
    };

    const { data: thisMonthExpenses, isLoading: isThisMonthExpensesLoading, isFetching } = getAllLists<Transaction>(
        ["Expenses", "Stats this month", user?.userId],
        [
            ENVS.DB_ID,
            "6467f98b8e8fe5ffa576",
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfThisMonth),
                Query.greaterThan("date", startOfThisMonth),
                Query.orderAsc("date"),
                Query.limit(100)
            ],
        ],
        { enabled: !!user }
    );

    const { data: earlierMonthExpenses, isLoading: isEarlierMonthExpensesLoading } = getAllLists<Transaction>(
        ["Expenses", "Stats earlier month", user?.userId],
        [
            ENVS.DB_ID,
            "6467f98b8e8fe5ffa576",
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfEarlierMonth),
                Query.greaterThan("date", startOfEarlierMonth)
            ],
        ],
        { enabled: !!user }
    );

    const { data: thisMonthIncomes } = getAllLists<Transaction>(
        ["Incomes", "Stats this month", user?.userId],
        [
            ENVS.DB_ID,
            "646879f739377942444c",
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfThisMonth),
                Query.greaterThan("date", startOfThisMonth)
            ],
        ],
        { enabled: !!user }
    );

    const { data: earlierMonthIncomes } = getAllLists<Transaction>(
        ["Incomes", "Stats earlier month", user?.userId],
        [
            ENVS.DB_ID,
            "646879f739377942444c",
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfEarlierMonth),
                Query.greaterThan("date", startOfEarlierMonth)
            ],
        ],
        { enabled: !!user }
    );


    const expenseStatsThisMonth = calcExpenseStats(thisMonthExpenses?.documents || []);
    const expenseStatsEarlierMonth = calcExpenseStats(earlierMonthExpenses?.documents || []);
    const expenseChange = calculateTransactionChange('expense', expenseStatsEarlierMonth.sum, expenseStatsThisMonth.sum)

    const incomeStatsThisMonth = calcExpenseStats(thisMonthIncomes?.documents || []);
    const incomeStatsEarlierMonth = calcExpenseStats(earlierMonthIncomes?.documents || []);
    const incomeChange = calculateTransactionChange('income', incomeStatsEarlierMonth.sum, incomeStatsThisMonth.sum);

    const savingsThisMonth = incomeStatsThisMonth.sum - expenseStatsThisMonth.sum;
    const savingsEarlierMonth = incomeStatsEarlierMonth.sum - expenseStatsEarlierMonth.sum;
    const savingsChange = calculateTransactionChange('saving', savingsEarlierMonth, savingsThisMonth);


    const expensesByCategoriesEarlierMonth = calculateTotalExpensesByCategory(earlierMonthExpenses?.documents || []);
    const expensesAndPercentByCategoryThisMonth = calculateTotalExpensesWithPercentageChange(thisMonthExpenses?.documents || [], expensesByCategoriesEarlierMonth)


    const statistics: DashboardStat[] = [
        {
            title: "Savings",
            metric: formatCurrency(userInfo?.prefs?.currency, savingsThisMonth),
            metricPrev: formatCurrency(userInfo?.prefs?.currency, savingsEarlierMonth),
            delta: savingsChange.percentage ? savingsChange.percentage.toFixed(2) + '%' : "0%",
            deltaType: savingsChange.transactionChange,
            change: savingsChange.change,
        },
        {
            title: "Expenses",
            metric: formatCurrency(userInfo?.prefs?.currency, expenseStatsThisMonth.sum),
            metricPrev: formatCurrency(userInfo?.prefs?.currency, expenseStatsEarlierMonth.sum),
            delta: expenseChange.percentage ? expenseChange.percentage.toFixed(2) + '%' : "0%",
            deltaType: expenseChange.transactionChange,
            change: expenseChange.change,
        },
        {
            title: "Income",
            metric: formatCurrency(userInfo?.prefs?.currency, incomeStatsThisMonth.sum),
            metricPrev: formatCurrency(userInfo?.prefs?.currency, incomeStatsEarlierMonth.sum),
            delta: incomeChange.percentage ? incomeChange.percentage.toFixed(2) + '%' : "0%",
            deltaType: incomeChange.transactionChange,
            change: incomeChange.change,
        },
    ];


    const isLoading = isThisMonthExpensesLoading || isEarlierMonthExpensesLoading

    return {
        statistics,
        expensesAndPercentByCategoryThisMonth,
        incomeThisMonth: incomeStatsThisMonth.sum,
        expenseThisMonth: expenseStatsThisMonth.sum,
        isLoading,
    }
}

export default useDashboard
