import {
  Card,
  DateRangePicker,
  DateRangePickerValue,
  Flex,
  LineChart,
  SelectBox,
  SelectBoxItem,
  Text,
  Title,
} from "@tremor/react";
import { Models } from "appwrite";
import ESCategoryChart from "expensasaures/components/category/ESCategoryChart";
import ExpenseByCategory from "expensasaures/components/category/ExpenseByCategory";
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
  const { data: thisMonthExpenses } = getAllLists<Transaction>(
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
    { enabled: !!user }
  );

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
        <Title className="py-10 text-center">Category</Title>
        <Flex className="items-baseline mb-10">
          <div className="">Date Range</div>
          <div className="ml-auto">
            <DateRangePicker onValueChange={setDates} value={dates} />
          </div>
        </Flex>
        {/* <div className="mb-10">
          <Text className="mt-10 mb-4">Expenses distribution</Text>
          <Flex>
            <Text>Rating Product A</Text>
            <Text>62%</Text>
          </Flex>
          <CategoryBar
            categoryPercentageValues={categoryBarInfo().percentageArray}
            colors={categoryBarInfo().colorClassArray}
           
            className="mt-3 w-full"
          />
          <CategoryBar
            categoryPercentageValues={[10, 20, 10]}
            colors={["emerald", "yellow", "orange", "rose"]}
            percentageValue={62}
            className="mt-3"
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
        )}
      </div>
    </Layout>
  );
};

export default Categories;
