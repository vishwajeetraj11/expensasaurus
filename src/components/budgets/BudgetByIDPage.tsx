import { ExclamationIcon } from "@heroicons/react/outline";
import {
    Callout, Grid, Metric, Subtitle,
    Tab,
    TabGroup, TabList,
    TabPanel,
    TabPanels,
    Title,
} from "@tremor/react";
import { Models, Query } from "appwrite";
import clsx from "clsx";
import { format } from "date-fns";
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
import { formatCurrency } from "expensasaures/shared/utils/currency";
import { useRouter } from "next/router";
import { Fragment, useCallback, useMemo } from "react";
import { AiOutlineTable } from 'react-icons/ai';
import { BiGridAlt } from 'react-icons/bi';
import { shallow } from "zustand/shallow";
import BudgetAnalysisTable from "./BudgetByIDTable";
import BudgetStatus from "./BudgetCalloutStatus";

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

    const budgetByCategory: { [key: string]: number } = useMemo(() => ({
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
        personal: data?.personal || 0,
        transportation: data?.transportation || 0,
    }), [data]);

    const expensesByCategory = calcTotalExpByCategoryBuget(
        budgetDurationExpenses?.documents || []
    );

    const match = useCallback(() => {
        const graphData: {
            topic: string;
            budget: number;
            spending: number;
        }[] = [];

        let totalExpense = 0;
        const result = Object.fromEntries(
            Object.entries(budgetByCategory).map(([key, val]) => {
                const expense = expensesByCategory[key];
                if (!expense) {

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
                }
                const { amount } = expense;

                totalExpense += amount;
                graphData.push({
                    topic: key,
                    budget: val,
                    spending: amount,
                });
                return [
                    key,
                    {
                        budget: val,
                        ...expense,
                        budgetPercent:
                            val === 0 && amount === 0 ? 0 : (amount / val) * 100,
                    },
                ];
            })
        );
        return { result, graphData, totalExpense };
    }, [budgetByCategory, expensesByCategory]);

    if (!data && error && error.code === 404) {
        return <Layout>
            <NotFound
                title="Budget Not Found"
                subtitle="Oops! It looks like the budget you are looking for is not found."
                description="Budgets are the building blocks of financial planning, but it seems the one you're looking for has gone astray. Don't worry, financial journeys often come with unexpected twists and turns. Take a moment to reassess your goals, review your existing budgets, or create a new one. Remember, every step counts towards achieving financial success. Stay determined, stay focused, and let's get back on track together!" />
        </Layout>
    }

    if (!data) return <></>
    const totalBudgetConsumedPercent = Math.ceil(match().totalExpense / data?.amount * 100)
    // const totalBudgetConsumedPercent = 20

    return (
        <div className="mx-auto max-w-[1200px] px-4 pt-10 block w-full">
            {isLoading ? <Searching
                title="Searching for budget..."
                subtitle="Please wait while we retrieve the budget details"
                description="Take control of your finances with our Budget Tracker. Plan wisely, spend consciously, and unlock your financial freedom."
            /> : isSuccess ? (
                <>
                    <TabGroup>
                        <div className="flex items-center justify-between mb-4">
                            <Metric className="text-slate-600 font-thin">Budget (Spending Limit)</Metric>
                            <div className="mt-8 flex justify-end flex-col items-end">
                                <p className="text-sm mb-2">
                                    {format(new Date(data?.startingDate), "dd MMMM yyyy")} - {" "}
                                    {format(new Date(data?.endDate), "dd MMMM yyyy")}
                                </p>
                                <TabList className="w-min">
                                    <Tab><BiGridAlt /></Tab>
                                    <Tab><AiOutlineTable /></Tab>
                                </TabList>
                            </div>
                        </div>

                        <Title className="mb-2">{data?.title}</Title>

                        <Subtitle className="mb-4 text-slate-500">{data?.description}</Subtitle>
                        <TabPanels>
                            <TabPanel>
                                <Subtitle className="my-6 text-slate-600">Spending in categories with budget</Subtitle>
                                <Grid numItemsSm={2} numItemsLg={3} className="gap-4">
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
                                    })}
                                </Grid>

                                {Object.entries(match().result).filter(([category, value]) => !value.budget).length !== 0 ? <Callout
                                    className="h-12 my-6"
                                    title="You seem to have spending in categories with no budget"
                                    icon={ExclamationIcon}
                                    color="red"
                                /> : <></>}

                                <Grid numItemsSm={2} numItemsLg={3} className="gap-4">
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
                                </Grid>
                            </TabPanel>
                            <TabPanel>

                                <BudgetAnalysisTable data={match().result} />
                            </TabPanel>
                        </TabPanels>
                        <div className='mt-6 flex flex-col sm:flex-row justify-between text-white bg-blue-700 p-6 shadow-subtle rounded-[500px] relative'>
                            <div style={{
                                width: totalBudgetConsumedPercent > 100 ? '100%' : totalBudgetConsumedPercent + '%'
                            }} className={clsx(
                                "absolute inset-0 z-[1] rounded-[500px] ",
                                totalBudgetConsumedPercent >= 20 && totalBudgetConsumedPercent <= 50
                                    ? 'bg-emerald-600'
                                    : totalBudgetConsumedPercent > 50 && totalBudgetConsumedPercent <= 80
                                        ? 'bg-yellow-500'
                                        : totalBudgetConsumedPercent > 80 && totalBudgetConsumedPercent <= 90
                                            ? 'bg-orange-600'
                                            : totalBudgetConsumedPercent > 90
                                                ? 'bg-rose-600'
                                                : null
                            )}>&nbsp;</div>
                            <p className="z-[2] text-[14px] sm:text-[16px]">Budget: {formatCurrency(data?.currency, data?.amount)}</p>
                            <p className="z-[2] text-[14px] sm:text-[16px]">{totalBudgetConsumedPercent.toFixed(2)}% consumed</p>
                            <p className="z-[2] text-[14px] sm:text-[16px]">Spending : {formatCurrency(data?.currency, match().totalExpense)}</p>
                        </div>
                        <BudgetStatus type={
                            match().totalExpense > data?.amount
                                ? 'fail'
                                : match().totalExpense < data?.amount
                                    ? 'success'
                                    : "on-track"
                        } />
                    </TabGroup>
                    <EBarChart data={match().graphData} />
                </>
            ) : null}
        </div>
    )
}

export default BudgetByIDPage



