import { ChevronDownIcon } from "@heroicons/react/solid";
import {
  Card,
  DateRangePicker,
  DateRangePickerValue,
  Flex,
  LineChart,
  SelectBox,
  SelectBoxItem,
  Subtitle,
  Text,
  Title
} from "@tremor/react";
import { Models } from "appwrite";
import ESCategoryChart from "expensasaures/components/category/ESCategoryChart";
import ExpenseByCategory from "expensasaures/components/category/ExpenseByCategory";
import { LineChartTabsLoading } from "expensasaures/components/dashboard/linechart";
import CategoryIcon from "expensasaures/components/forms/CategorySelect";
import Layout from "expensasaures/components/layout/Layout";
import useDates, { dataFormatter } from "expensasaures/hooks/useDates";
import { categories } from "expensasaures/shared/constants/categories";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { calculateTotalExpensesByCategory } from "expensasaures/shared/utils/calculation";
import { capitalize } from "expensasaures/shared/utils/common";
import { getQueryForCategoryPage } from "expensasaures/shared/utils/react-query";
import { Fragment, useState } from "react";
import { shallow } from "zustand/shallow";

const Categories = () => {
  const { endOfThisMonth, startOfThisMonth } = useDates();
  const [dates, setDates] = useState<DateRangePickerValue>([
    new Date(startOfThisMonth),
    new Date(endOfThisMonth),
  ]);

  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const { data: thisMonthExpenses, isLoading } = getAllLists<Transaction>(
    ["Expenses", "Stats this month", user?.userId, dates[0], dates[1]],
    [
      ENVS.DB_ID,
      "6467f98b8e8fe5ffa576",
      getQueryForCategoryPage({
        dates,
        user,
        limit: 100
      }),
    ],
    { enabled: !!user, keepPreviousData: true }
  );

  // const isLoading = true;
  // const isLoading = isCategoryLoading;

  const expensesByCategoriesThisMonth = calculateTotalExpensesByCategory(
    thisMonthExpenses?.documents || []
  );

  // const categoryBarInfo = () => {
  //   const percentageArray = Object.entries(expensesByCategoriesThisMonth).map(
  //     ([key, val]) => {
  //       return Math.ceil(val.percentage);
  //     }
  //   );
  //   const colorClassArray = Object.entries(expensesByCategoriesThisMonth).map(
  //     ([key, val]) => {
  //       let className = categories.find((c) => c.category === capitalize(key))
  //         ?.className as string;
  //       const regexPattern = /(?:bg|text)-(.*?)-\d+/g;
  //       const colorNames = [];
  //       let match;
  //       while ((match = regexPattern.exec(className))) {
  //         colorNames.push(match[1]);
  //       }
  //       return colorNames[0];
  //     }
  //   );
  //   return { percentageArray, colorClassArray };
  // };

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
      <div className="mx-auto max-w-[1200px] px-4 w-full">
        {isLoading ?
          <CategoryLoading /> : <> <Title className="py-10 text-center">Category</Title>
            <Flex className="flex-col md:flex-row items-baseline mb-10">
              <Text className="text-slate-600">Date Range</Text>
              <div className="mt-2 md:mt-0 md:ml-auto w-full md:w-auto">
                <DateRangePicker onValueChange={setDates} value={dates} />
              </div>
            </Flex>
            {/* <div className="mb-10">
          <Text className="mt-10 mb-4">Expenses distribution</Text>

          <CategoryBar
            categoryPercentageValues={categoryBarInfo().percentageArray}
            colors={categoryBarInfo().colorClassArray as Color[]}
            className="mt-3 w-full"
          />

        </div> */}
            <Text className="text-slate-600 mb-4">Expenses per category</Text>
            <div className="grid xl:grid-cols-4  lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
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
            <div className="flex justify-between items-center my-10">
              <Text className="text-slate-600">Category wise transactions</Text>
              <SelectBox
                className="w-[300px]"
                onValueChange={(value) => setSelectedCategory(value as string)}
                value={selectedCategory}
              >
                {categories.map((category, index) => {
                  const CIcon = () => <CategoryIcon category={category} />;
                  return (
                    <SelectBoxItem
                      key={category.id}
                      value={category.key}
                      text={category.category}
                      icon={CIcon}
                    />
                  );
                })}
              </SelectBox>
            </div>
            {txnsByCategory.length !== 0 ? (
              <Card className="box-shadow-card">
                <LineChart
                  className="h-80 mt-8"
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
              <ESCategoryChart />
            )}</>}

      </div>
    </Layout>
  );
};

const CategoryLoading = () => {
  return (
    <>
      <Title className="py-10 text-center">Category</Title>
      <Flex className="items-baseline mb-10">
        <Subtitle className="text-slate-600">Date Range</Subtitle>
        <div className="ml-auto">
          <div className="h-[38px] w-[400px] flex items-center justify-center p-6 relative overflow-hidden rounded-md bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 before:to-transparent">
            <div className="h-[15px] bg-slate-400/20 rounded-full w-[150px]">&nbsp;</div>
            <ChevronDownIcon className="ml-auto text-slate-300 text-[12px] h-5 w-5" />
          </div>
        </div>
      </Flex>

      <Text className="text-slate-600 mb-4">Expenses per category</Text>
      <div className="grid xl:grid-cols-4  lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(
          (_, i) => (
            <div key={_} className="h-[88px] p-6 w-full flex items-center relative overflow-hidden rounded-2xl bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 before:to-transparent">
              <div className="w-10 h-10 rounded-full bg-slate-400/20 mr-3">&nbsp;</div>
              <div className="">
                <div className="h-[13px] bg-slate-400/20 rounded-full w-[60px] mb-2">&nbsp;</div>
                <div className="h-[13px] bg-slate-400/20 rounded-full w-[70px]">&nbsp;</div>
              </div>
              <div className="h-[13px] bg-slate-500/20 rounded-full w-[50px] mb-2 ml-auto">&nbsp;</div>
            </div>
          )
        )}
      </div>
      <div className="flex justify-between items-center my-10">
        <Text className="text-slate-600">Category wise transactions</Text>
        <div className="h-[38px] w-[300px] flex items-center justify-center p-6 relative overflow-hidden rounded-md bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 before:to-transparent">
          <div className="h-[15px] bg-slate-400/20 rounded-full w-[150px]">&nbsp;</div>
          <ChevronDownIcon className="ml-auto text-slate-300 text-[12px] h-5 w-5" />
        </div>
      </div>
      <LineChartTabsLoading />
    </>
  );
}

export default Categories;
