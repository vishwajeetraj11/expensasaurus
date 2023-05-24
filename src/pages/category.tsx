import {
  Card,
  DateRangePicker,
  DateRangePickerValue,
  Flex,
  LineChart,
  Text,
  Title,
} from "@tremor/react";
import { Models, Query } from "appwrite";
import clsx from "clsx";
import Layout from "expensasaures/components/layout/Layout";
import useDates, { dataFormatter } from "expensasaures/hooks/useDates";
import { categories } from "expensasaures/shared/constants/categories";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { calculateTotalExpensesByCategory } from "expensasaures/shared/utils/calculation";
import { capitalize } from "expensasaures/shared/utils/common";
import { useRouter } from "next/router";
import { useState } from "react";
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
  const { data: thisMonthExpenses } = getAllLists<Transaction>(
    ["Expenses", "Stats this month", user?.userId],
    [
      "6467f9811c14ca905ed5",
      "6467f98b8e8fe5ffa576",
      [
        Query.equal("userId", user?.userId),
        Query.lessThanEqual("date", endOfThisMonth),
        Query.greaterThan("date", startOfThisMonth),
        Query.orderAsc("date"),
      ],
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

  {
    /* Category Spending per day */
  }

  const router = useRouter();
  return (
    <Layout>
      <div className="mx-auto max-w-[1200px]">
        <Title className="py-10 text-center">Category</Title>
        <Flex className="items-baseline mb-10">
          <div className="">Filters</div>
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
        <Text className="mb-4">Expenses per category for this month.</Text>
        <div className="grid xl:grid-cols-4  lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
          {Object.entries(expensesByCategoriesThisMonth).map(
            ([category, value], i) => {
              const categoryInfo = categories.find(
                (c) => c.category === capitalize(category)
              );
              const SelectedIcon = categoryInfo?.Icon;

              return (
                <Card
                  onClick={() => {
                    router.push(
                      `/expenses?category=${encodeURIComponent(category)}`
                    );
                  }}
                  className="box-shadow-card border-none ring-0 cursor-pointer"
                  key={i}
                >
                  <div className="flex">
                    {SelectedIcon && (
                      <div
                        className={clsx(
                          "w-10 h-10 bg-opacity-25 rounded-full flex items-center justify-center mr-3",
                          categoryInfo.className
                        )}
                      >
                        <SelectedIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <Text className="font-medium text-slate-700">
                          {capitalize(category)}
                        </Text>
                        <Text className="font-bold text-slate-900">
                          ₹{value.amount}
                        </Text>
                      </div>
                      <Text className="text-slate-700">
                        {value.transactionsCount} transaction
                        {value.transactionsCount > 1 ? "s" : ""}
                      </Text>
                    </div>
                  </div>
                  {false && thisMonthExpenses?.documents
                    ? thisMonthExpenses?.documents.length > 0 && (
                        <LineChart
                          className="h-80 mt-8"
                          data={thisMonthExpenses?.documents
                            .filter((expense) => expense.category === category)
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
                            })}
                          index="date"
                          categories={["amount"]}
                          colors={["blue"]}
                          valueFormatter={dataFormatter}
                          showLegend={false}
                          yAxisWidth={60}
                          showXAxis
                        />
                      )
                    : null}
                </Card>
              );
            }
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
