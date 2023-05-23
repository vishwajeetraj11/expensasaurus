import {
  BadgeDelta,
  Bold,
  Button,
  Card,
  DeltaType,
  Divider,
  DonutChart,
  Flex,
  List,
  ListItem,
  Metric,
  Text,
  Title,
  Toggle,
  ToggleItem,
} from "@tremor/react";

import { ChartPieIcon, ViewListIcon } from "@heroicons/react/outline";

import { ArrowNarrowRightIcon } from "@heroicons/react/solid";

import { CategoryData } from "expensasaures/shared/utils/calculation";
import { capitalize } from "expensasaures/shared/utils/common";
import { useEffect, useState } from "react";

interface StockData {
  name: string;
  value: number;
  performance: string;
  deltaType: DeltaType;
}

const valueFormatter = (number: number) =>
  `₹ ${Intl.NumberFormat("us").format(number).toString()}`;

interface Props {
  expensesAndPercentByCategoryThisMonth: Record<string, CategoryData>;
  incomeThisMonth: number;
  expenseThisMonth: number;
}

export default function CategoriesPieChart(props: Props) {
  const {
    expensesAndPercentByCategoryThisMonth,
    incomeThisMonth,
    expenseThisMonth,
  } = props;
  const [selectedView, setSelectedView] = useState("chart");
  const [categoryExpense, setCategoryExpense] = useState<StockData[] | []>([]);

  useEffect(() => {
    const stocks: StockData[] = [];
    if (expensesAndPercentByCategoryThisMonth) {
      Object.entries(expensesAndPercentByCategoryThisMonth).forEach(
        ([key, value]) => {
          const percent = value.percentageChange;
          stocks.push({
            name: capitalize(key),
            value: value.totalExpenses,
            performance: value.percentageChange.toFixed(2) + "%",
            deltaType:
              percent > 30
                ? "increase"
                : percent < 30 && percent > 0
                ? "moderateIncrease"
                : percent < 0 && percent > -10
                ? "moderateDecrease"
                : "decrease",
          });
        }
      );
    }
    setCategoryExpense(stocks);
  }, [expensesAndPercentByCategoryThisMonth]);

  return (
    // <Card className="max-w-md mx-auto">
    <Card className="">
      <Flex className="space-x-8" justifyContent="between" alignItems="center">
        <Title>Overview</Title>
        <Toggle
          defaultValue="chart"
          color="gray"
          onValueChange={(value) => setSelectedView(value)}
        >
          <ToggleItem value="chart" icon={ChartPieIcon} />
          <ToggleItem value="list" icon={ViewListIcon} />
        </Toggle>
      </Flex>
      <Text className="mt-8">Remaining Balance</Text>
      <Metric>₹ {incomeThisMonth - expenseThisMonth}</Metric>
      <Divider />

      {selectedView === "chart" ? (
        <DonutChart
          data={categoryExpense}
          variant="pie"
          showAnimation={false}
          category="value"
          index="name"
          valueFormatter={valueFormatter}
          className="mt-6"
        />
      ) : (
        <>
          <Flex className="mt-8" justifyContent="between">
            <Text className="truncate">
              <Bold>Category</Bold>
            </Text>
            <Text>**</Text>
          </Flex>
          <List className="mt-4">
            {categoryExpense.map((stock) => (
              <ListItem key={stock.name}>
                <Text className="font-medium text-stone-500">{stock.name}</Text>
                <Flex justifyContent="end" className="space-x-2">
                  <Text className="font-medium text-stone-700">
                    ₹ {Intl.NumberFormat("us").format(stock.value).toString()}
                  </Text>
                  <BadgeDelta deltaType={stock.deltaType} size="xs">
                    {stock.performance}
                  </BadgeDelta>
                </Flex>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Flex className="mt-6 pt-4 border-t">
        <Button
          size="xs"
          variant="light"
          icon={ArrowNarrowRightIcon}
          iconPosition="right"
        >
          View more
        </Button>
      </Flex>
    </Card>
  );
}
