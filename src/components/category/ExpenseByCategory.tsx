import { Card, Text } from "@tremor/react";
import clsx from "clsx";
import { categories } from "expensasaures/shared/constants/categories";
import { capitalize } from "expensasaures/shared/utils/common";
import { useRouter } from "next/router";

interface Props {
  category: string;
  value: {
    amount: number;
    transactionsCount: number;
    budget?: number;
  };
  categoryInfo: (typeof categories)[number];
  SelectedIcon?: (typeof categories)[number]["Icon"];
  i: number;
}

const ExpenseByCategory = (props: Props) => {
  const { category, categoryInfo, i, value, SelectedIcon } = props;

  const router = useRouter();
  return (
    <Card
      onClick={() => {
        router.push(`/expenses?category=${encodeURIComponent(category)}`);
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
              {value.budget ? `/${value.budget}` : ""}
            </Text>
          </div>
          <Text className="text-slate-700">
            {value.transactionsCount} transaction
            {value.transactionsCount > 1 ? "s" : ""}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseByCategory;

{
  /* {false && thisMonthExpenses?.documents
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
      : null} */
}
