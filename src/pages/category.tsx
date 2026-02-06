import {
  Card,
  DateRangePicker,
  DateRangePickerValue,
  Flex,
  LineChart,
  Select,
  SelectItem,
  Text,
  Title,
} from "@tremor/react";
import { Models } from "appwrite";
import CategoryLoading from "expensasaurus/components/category/CategoryLoading";
import ExpenseByCategory from "expensasaurus/components/category/ExpenseByCategory";
import { LineChartTabsLoading } from "expensasaurus/components/dashboard/linechart";
import CategoryIcon from "expensasaurus/components/forms/CategorySelect";
import Layout from "expensasaurus/components/layout/Layout";
import useDates from "expensasaurus/hooks/useDates";
import { categories } from "expensasaurus/shared/constants/categories";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { getAllLists } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { calculateTotalExpensesByCategory } from "expensasaurus/shared/utils/calculation";
import { capitalize } from "expensasaurus/shared/utils/common";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import { getQueryForCategoryPage } from "expensasaurus/shared/utils/react-query";
import Head from "next/head";
import { Fragment, useState } from "react";
import { shallow } from "zustand/shallow";

const Categories = () => {
  const { endOfThisMonth, startOfThisMonth } = useDates();
  const [dates, setDates] = useState<DateRangePickerValue>({
    from: new Date(startOfThisMonth),
    to: new Date(endOfThisMonth),
  });

  const { user, userInfo } = useAuthStore(
    (state) => ({ user: state.user, userInfo: state.userInfo }),
    shallow
  ) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>;
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const { data: thisMonthExpenses, isLoading } = getAllLists<Transaction>(
    ["Expenses", "Stats this month", user?.userId, dates.from, dates.to],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.EXPENSES,
      getQueryForCategoryPage({
        dates,
        user,
        limit: 100,
      }),
    ],
    { enabled: !!user, keepPreviousData: true }
  );

  // const isLoading = true;
  // const isLoading = isCategoryLoading;

  const expensesByCategoriesThisMonth = calculateTotalExpensesByCategory(
    thisMonthExpenses?.documents || []
  );

  const dataFormatter = (number: number) => {
    return formatCurrency(userInfo?.prefs?.currency, number);
  };

  const txnsByCategory =
    thisMonthExpenses?.documents
      .filter((expense) => expense.category === selectedCategory)
      .map((expense) => {
        const date = new Date(expense.date);
        const dateResult =
          date.getDate() +
          "." +
          (date.getMonth() + 1) +
          "." +
          date.getFullYear();
        return {
          date: dateResult,
          amount: expense.amount,
        };
      }) || [];

  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Analyze Spending by Category</title>
      </Head>
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-16">
        {isLoading ? (
          <CategoryLoading />
        ) : (
          <>
            <Title className="py-10 text-center text-slate-900 dark:text-slate-100">
              Category Insights
            </Title>
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.6)] dark:border-white/10 dark:bg-slate-900/75 md:p-7">
              <Flex className="mb-8 flex-col items-baseline gap-3 md:flex-row md:items-center">
                <Text className="font-medium text-slate-600 dark:text-slate-300">
                  Date range
                </Text>
                <div className="mt-2 w-full md:ml-auto md:mt-0 md:w-auto">
                  <DateRangePicker onValueChange={setDates} value={dates} />
                </div>
              </Flex>
              <Text className="mb-4 text-slate-600 dark:text-slate-300">
                Expenses per category
              </Text>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.entries(expensesByCategoriesThisMonth).map(
                  ([category, value], i) => {
                    const categoryInfo = categories.find(
                      (c) => c.category === capitalize(category)
                    );
                    const SelectedIcon = categoryInfo?.Icon;
                    if (!categoryInfo) return <Fragment key={i}></Fragment>;
                    return (
                      <ExpenseByCategory
                        key={i}
                        category={category}
                        categoryInfo={categoryInfo}
                        SelectedIcon={SelectedIcon}
                        value={value}
                        i={i}
                      />
                    );
                  }
                )}
              </div>
              <div className="my-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Text className="text-slate-600 dark:text-slate-300">
                  Category-wise transactions
                </Text>

                <Select
                  className="w-full md:w-[320px]"
                  onValueChange={(value) => setSelectedCategory(value as string)}
                  value={selectedCategory}
                >
                  {Object.entries(expensesByCategoriesThisMonth).map(
                    ([category, value], i) => {
                      const categoryInfo = categories.find(
                        (c) => c.category === capitalize(category)
                      );
                      if (!categoryInfo) return <Fragment key={i}></Fragment>;
                      const SelectedIcon = () => (
                        <CategoryIcon category={categoryInfo} />
                      );
                      return (
                        <SelectItem
                          key={categoryInfo.id}
                          value={categoryInfo.key}
                          icon={SelectedIcon}
                        >
                          {categoryInfo.category}
                        </SelectItem>
                      );
                    }
                  )}
                </Select>
              </div>
              {txnsByCategory.length !== 0 ? (
                <Card className="box-shadow-card border border-slate-200/70 bg-white/95 ring-0 dark:border-white/10 dark:bg-slate-900/70">
                  <LineChart
                    className="mt-8 h-80"
                    data={txnsByCategory}
                    index="date"
                    curveType="natural"
                    categories={["amount"]}
                    colors={["blue"]}
                    valueFormatter={dataFormatter}
                    showLegend={false}
                    yAxisWidth={60}
                    showXAxis
                  />
                </Card>
              ) : (
                <>
                  <LineChartTabsLoading animate={false} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Categories;
