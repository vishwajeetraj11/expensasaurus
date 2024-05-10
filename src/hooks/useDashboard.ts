import {
    Models, Query
} from 'appwrite';
import { ENVS } from 'expensasaurus/shared/constants/constants';
import { getAllLists } from 'expensasaurus/shared/services/query';
import { useAuthStore } from 'expensasaurus/shared/stores/useAuthStore';
import { useGlobalStore } from 'expensasaurus/shared/stores/useGlobalStore';
import { DashboardStat, Transaction } from 'expensasaurus/shared/types/transaction';
import { calcExpenseStats, calculateTotalExpensesByCategory, calculateTotalExpensesWithPercentageChange, calculateTransactionChange } from 'expensasaurus/shared/utils/calculation';
import { formatCurrency } from 'expensasaurus/shared/utils/currency';
import { shallow } from 'zustand/shallow';

type useDashboardProps = {
    endOfEarlierMonth: string,
    endOfTheMonth: string,
    startOfEarlierMonth: string,
    startOfTheMonth: string,
}

const useDashboard = ({ endOfEarlierMonth, endOfTheMonth, startOfEarlierMonth, startOfTheMonth, }: useDashboardProps) => {
    const { activeMonth } = useGlobalStore();

    const { user, userInfo } = useAuthStore((state) => ({ user: state.user, userInfo: state.userInfo }), shallow) as {
        user: Models.Session;
        userInfo: Models.User<Models.Preferences>;
    };

    const { data: thisMonthExpenses, isLoading: isThisMonthExpensesLoading, isFetching } = getAllLists<Transaction>(
        ["Expenses", "Stats this month", activeMonth, user?.userId],
        [
            ENVS.DB_ID,
            ENVS.COLLECTIONS.EXPENSES,
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfTheMonth),
                Query.greaterThan("date", startOfTheMonth),
                Query.orderAsc("date"),
                Query.limit(100)
            ],
        ],
        { enabled: !!user }
    );

    const { data: earlierMonthExpenses, isLoading: isEarlierMonthExpensesLoading } = getAllLists<Transaction>(
        ["Expenses", "Stats earlier month", activeMonth, user?.userId],
        [
            ENVS.DB_ID,
            ENVS.COLLECTIONS.EXPENSES,
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfEarlierMonth),
                Query.greaterThan("date", startOfEarlierMonth)
            ],
        ],
        { enabled: !!user }
    );

    const { data: thisMonthIncomes } = getAllLists<Transaction>(
        ["Incomes", "Stats this month", activeMonth, user?.userId],
        [
            ENVS.DB_ID,
            ENVS.COLLECTIONS.INCOMES,
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfTheMonth),
                Query.greaterThan("date", startOfTheMonth)
            ],
        ],
        { enabled: !!user }
    );

    const { data: earlierMonthIncomes } = getAllLists<Transaction>(
        ["Incomes", "Stats earlier month", activeMonth, user?.userId],
        [
            ENVS.DB_ID,
            ENVS.COLLECTIONS.INCOMES,
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
        // activeMonth,
        // setActiveMonth,
        // onMonthChange
    }
}

export default useDashboard
