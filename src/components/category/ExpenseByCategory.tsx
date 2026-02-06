import { CircularProgress } from "@mui/material";
import { Card, Text } from "@tremor/react";
import clsx from "clsx";
import { categories } from "expensasaurus/shared/constants/categories";
import { routeBuilders } from "expensasaurus/shared/constants/routes";
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
        router.push(routeBuilders.expensesByCategory(category));
      }}
      className={clsx(
        "box-shadow-card cursor-pointer border border-slate-200/70 bg-white/95 ring-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-white/25",
        value.transactionsCount !== 0 && "group"
      )}
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
              <Text className="absolute inset-0 hidden items-center justify-center text-xs text-slate-600 dark:text-slate-200 group-hover:flex">
                {Math.ceil(budgetPercent)}%
              </Text>
            )}
          </div>
        )}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <Text className="font-medium text-slate-700 dark:text-slate-200">
              {capitalize(category)}
            </Text>

            <Text className="font-bold text-slate-900 dark:text-slate-100">
              {value.currency && formatCurrency(value.currency, value.amount)}
              {value.budget && value.currency
                ? `/${formatCurrency(value.currency, value.budget)}`
                : ""}
            </Text>
          </div>
          <div className="flex">
            <Text className="text-slate-600 dark:text-slate-300">
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
