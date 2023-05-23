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
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(expensesByCategoriesThisMonth).map(
            ([category, value], i) => {
              const SelectedIcon = categories.find(
                (c) => c.category === capitalize(category)
              )?.Icon;
              return (
                <Card
                  onClick={() => {
                    router.push(
                      `/expenses?category=${encodeURIComponent(category)}`
                    );
                  }}
                  className="w-full  box-shadow-card border-none ring-0 cursor-pointer"
                  key={i}
                >
                  <div className="flex">
                    {" "}
                    {SelectedIcon && (
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                        <SelectedIcon className="w-5 h-5 text-white" />
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
                  {thisMonthExpenses?.documents
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
