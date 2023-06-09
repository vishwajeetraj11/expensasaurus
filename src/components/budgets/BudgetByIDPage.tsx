import { ExclamationIcon } from "@heroicons/react/outline";
import { Button, Callout, Metric, Subtitle, Title } from "@tremor/react";
import { Models, Query } from "appwrite";
import EBarChart from "expensasaures/components/budgets/BudgetBarChart";
import ExpenseByCategory from "expensasaures/components/category/ExpenseByCategory";
import Layout from "expensasaures/components/layout/Layout";
import NotFound from "expensasaures/components/lottie/notFound";
import Searching from "expensasaures/components/lottie/searching";
import { categories } from "expensasaures/shared/constants/categories";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getAllLists, getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Budget } from "expensasaures/shared/types/budget";
import { Transaction } from "expensasaures/shared/types/transaction";
import { calcTotalExpByCategoryBuget } from "expensasaures/shared/utils/calculation";
import { capitalize } from "expensasaures/shared/utils/common";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { shallow } from "zustand/shallow";

const BudgetByIDPage = () => {
    const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
        user: Models.Session;
    };
    const router = useRouter();
    const { id } = router.query;

    const { data, isLoading: isDocLoading, isSuccess: isDocSuccess, error } = getDoc<Budget>(
        ["Budget by ID", id, user?.userId],
        [ENVS.DB_ID, ENVS.COLLECTIONS.BUDGETS, id as string],
        { enabled: !!user }
    );

    const { data: budgetDurationExpenses, isLoading: isBDELoading, isSuccess: isBDESuccess } = getAllLists<Transaction>(
        ["Expenses", data?.startingDate, data?.endDate],
        [
            ENVS.DB_ID,
            ENVS.COLLECTIONS.EXPENSES,
            [Query.equal("userId", user?.userId), Query.limit(100),
            Query.lessThanEqual("date", data?.endDate || ''),
            Query.greaterThan("date", data?.startingDate || ''),],
        ],
        {
            enabled: !!data,
        }
    );

    const isLoading = isDocLoading || isBDELoading;
    // const isLoading = true;
    const isSuccess = isDocSuccess && isBDESuccess;

    const budgetByCategory: { [key: string]: number } = {
        business: data?.business || 0,
        entertainment: data?.entertainment || 0,
        food: data?.food || 0,
        healthcare: data?.healthcare || 0,
        education: data?.education || 0,
        travel: data?.travel || 0,
        other: data?.other || 0,
        savings: data?.savings || 0,
        housing: data?.housing || 0,
        insurance: data?.insurance || 0,
        utilities: data?.utilities || 0,
        investments: data?.investments || 0,
        personalcare: data?.personalcare || 0,
        transportation: data?.transportation || 0,
    };

    const expensesByCategory = calcTotalExpByCategoryBuget(
        budgetDurationExpenses?.documents || []
    );

    const match = () => {
        const graphData: {
            topic: string;
            budget: number;
            spending: number;
        }[] = [];
        const result = Object.fromEntries(
            Object.entries(budgetByCategory).map(([key, val]) => {
                if (!expensesByCategory[key])
                    return [
                        key,
                        {
                            budget: val,
                            currency: "INR",
                            amount: 0,
                            transactionsCount: 0,
                            budgetPercent: 0,
                        },
                    ];
                graphData.push({
                    topic: key,
                    budget: val,
                    spending: expensesByCategory[key].amount,
                });
                return [
                    key,
                    {
                        budget: val,
                        ...expensesByCategory[key],
                        budgetPercent:
                            val === 0 && expensesByCategory[key].amount === 0
                                ? 0
                                : (expensesByCategory[key].amount / val) * 100
                        // : val > expensesByCategory[key].amount
                        //   ? (expensesByCategory[key].amount / val) * 100
                        //   : 100,
                    },
                ];
            })
        );
        return { result, graphData };
    };

    if (error && error.code === 404) {
        return <Layout>
            <NotFound
                title="Budget Not Found"
                subtitle="Oops! It looks like the budget you are looking for is not found."
                description="Budgets are the building blocks of financial planning, but it seems the one you're looking for has gone astray. Don't worry, financial journeys often come with unexpected twists and turns. Take a moment to reassess your goals, review your existing budgets, or create a new one. Remember, every step counts towards achieving financial success. Stay determined, stay focused, and let's get back on track together!" />
        </Layout>
    }

    return (
        <div className="mx-auto max-w-[1200px] pt-10 block w-full">
            {isLoading ? <Searching
                title="Searching for budget..."
                subtitle="Please wait while we retrieve the budget details"
                description="Take control of your finances with our Budget Tracker. Plan wisely, spend consciously, and unlock your financial freedom."
            /> : isSuccess ? (<>
                <div className="flex items-center justify-between mb-4">
                    <Metric className="text-slate-600 font-thin">Spending Limit</Metric>
                    <Button>Budget Analysis</Button>
                </div>
                <Title className="mb-2">{data?.title}</Title>

                <Subtitle className="mb-4 text-slate-500">{data?.description}</Subtitle>
                <Subtitle className="my-6 text-slate-600">Spending in categories with budget</Subtitle>
                <div className="grid grid-cols-3 gap-4">
                    {Object.entries(match().result).filter(([category, value]) => value.budget).map(([category, value], i) => {
                        const categoryInfo = categories.find(
                            (c) => c.category === capitalize(category)
                        );
                        const SelectedIcon = categoryInfo?.Icon;
                        if (!categoryInfo) return <Fragment key={i}></Fragment>;
                        if (!value.budget && !value.transactionsCount) return <Fragment key={i}></Fragment>;
                        return (
                            <ExpenseByCategory
                                type='budget-defined'
                                key={i}
                                category={category}
                                categoryInfo={categoryInfo}
                                SelectedIcon={SelectedIcon}
                                value={{
                                    currency: value.currency,
                                    amount: value.amount,
                                    transactionsCount: value.transactionsCount,
                                    budget: value.budget,
                                    budgetPercent: value.budgetPercent,
                                }}
                                i={i}
                            />
                        );
                    })}</div>

                {Object.entries(match().result).filter(([category, value]) => !value.budget).length !== 0 && <Callout
                    className="h-12 my-6"
                    title="You seem to have spending in categories with no budget"
                    icon={ExclamationIcon}
                    color="red"
                />}

                <div className="grid grid-cols-3 gap-4">
                    {Object.entries(match().result).filter(([category, value]) => !value.budget).map(([category, value], i) => {
                        const categoryInfo = categories.find(
                            (c) => c.category === capitalize(category)
                        );
                        const SelectedIcon = categoryInfo?.Icon;
                        if (!categoryInfo) return <Fragment key={i}></Fragment>;
                        if (!value.budget && !value.transactionsCount) return <Fragment key={i}></Fragment>;
                        return (
                            <ExpenseByCategory
                                type='budget-not-defined'
                                key={i}
                                category={category}
                                categoryInfo={categoryInfo}
                                SelectedIcon={SelectedIcon}
                                value={{
                                    currency: value.currency,
                                    amount: value.amount,
                                    transactionsCount: value.transactionsCount,
                                    budget: value.budget,
                                    budgetPercent: value.budgetPercent,
                                }}
                                i={i}
                            />
                        );
                    })}
                </div>
                <EBarChart data={match().graphData} /></>) : null}
        </div>
    )
}

export default BudgetByIDPage