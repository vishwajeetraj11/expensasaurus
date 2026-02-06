import { CircularProgress } from "@mui/material";
import { Card, Text } from "@tremor/react";
import clsx from "clsx";
import { categories } from "expensasaurus/shared/constants/categories";
import { capitalize } from "expensasaurus/shared/utils/common";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import { useRouter } from "next/router";
import CategoryBadge from "expensasaurus/components/ui/CategoryBadge";

interface Props {
  category: string;
  value: {
    amount: number;
    transactionsCount: number;
    budget?: number;
    currency: string;
    budgetPercent?: number;
  };
  categoryInfo: (typeof categories)[number];
  SelectedIcon?: (typeof categories)[number]["Icon"];
  i: number;
  type?: 'budget-defined' | 'budget-not-defined';
}

const ExpenseByCategory = (props: Props) => {
  const { category, categoryInfo, i, value, SelectedIcon } = props;
  const budgetDefined = props.type === 'budget-defined';
  const router = useRouter();
  const budgetPercent =
    typeof value.budgetPercent === "number" ? value.budgetPercent : null;
  const shouldShowBudgetPercent =
    budgetDefined && budgetPercent !== null && budgetPercent !== 0;

  return (
    <Card
      onClick={() => {
        router.push(`/expenses?category=${encodeURIComponent(category)}`);
      }}
      className={clsx("box-shadow-card border-none ring-0 cursor-pointer", value.transactionsCount !== 0 && 'group')}
      key={i}
    >
      <div className="flex">
        {SelectedIcon && (
          <div className={"relative"}>
            <CategoryBadge
              Icon={SelectedIcon}
              colorClassName={categoryInfo.className}
              size="md"
              className={clsx("mr-3", shouldShowBudgetPercent ? "group-hover:opacity-0" : "")}
            />
            {budgetDefined && budgetPercent !== null && (
              <CircularProgress
                thickness={2}
                itemProp=""
                color="inherit"
                size="lg"
                variant="determinate"
                value={budgetPercent > 100 ? 100 : budgetPercent}
                className={clsx(
                  "h-11 w-11 absolute top-[-2px] left-[-2px]",
                  categoryInfo.className.split(' ')[1]
                )}
              />
            )}
            {shouldShowBudgetPercent && (
              <Text className="text-xs hidden group-hover:block text-slate-600 absolute inset-0 flex items-center justify-center">
                {Math.ceil(budgetPercent)}%
              </Text>
            )}
          </div>
        )}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <Text className="font-medium text-slate-700">
              {capitalize(category)}
            </Text>

            <Text className="font-bold text-slate-900">
              {value.currency && formatCurrency(value.currency, value.amount)}
              {value.budget && value.currency
                ? `/${formatCurrency(value.currency, value.budget)}`
                : ""}
            </Text>
          </div>
          <div className="flex">
            <Text className="text-slate-700">
              {JSON.stringify(value.transactionsCount)} transaction
              {value.transactionsCount > 1 || value.transactionsCount === 0
                ? "s"
                : ""}
            </Text>
            {/* {value.budgetPercent ? (
              <Text
                className={clsx(
                  "ml-auto border rounded-full font-medium px-2 text-xs py-1 mt-1",
                  "text-slate-600 border-slate-300"
                  // value.budgetPercent === 100
                  //   ? "border-red-400 text-red-500"
                  //   : "border-blue-500 text-blue-600"
                )}
              >
                {value.budgetPercent?.toFixed(1)}%
              </Text>
            ) : null} */}
          </div>
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
