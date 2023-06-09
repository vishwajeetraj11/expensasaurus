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
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Title
} from "@tremor/react";


import { ArrowNarrowRightIcon } from "@heroicons/react/solid";

import { ChartPieIcon, ViewListIcon } from "@heroicons/react/outline";
import { categories } from "expensasaures/shared/constants/categories";
import { CategoryData } from "expensasaures/shared/utils/calculation";
import Link from "next/link";
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

const CategoriesPieChart = (props: Props) => {
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
            name: categories.find((category) => category.key === key)?.category || "",
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
    <Card className="box-shadow-card">
      <TabGroup className="">
        <Flex className="space-x-8" justifyContent="between" alignItems="center">
          <Title>Overview</Title>

          <TabList>
            <Tab icon={ChartPieIcon}></Tab>
            <Tab icon={ViewListIcon}></Tab>
          </TabList>

        </Flex>
        <Text className="mt-8">Savings</Text>
        <Metric>₹ {incomeThisMonth - expenseThisMonth}</Metric>
        <Divider />

        <TabPanels>
          <TabPanel>

            <DonutChart
              data={categoryExpense}
              variant="pie"
              showAnimation={false}
              category="value"
              index="name"
              valueFormatter={valueFormatter}
              className="mt-6"
            />
          </TabPanel>
          <TabPanel>
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
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <Flex className="mt-6 pt-4 border-t">
        <Link href={'/category'} shallow>
          <Button
            size="xs"
            variant="light"
            icon={ArrowNarrowRightIcon}
            iconPosition="right"
          >
            View more
          </Button></Link>
      </Flex>
    </Card>
  );
}

export default CategoriesPieChart;

export const CategoriesPieChartLoading = () => {
  return <div className="relative p-6 w-full mb-5 overflow-hidden rounded-2xl bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 before:to-transparent">
    <div className="flex items-center justify-between">
      <div className="h-[28px] bg-slate-500/20 rounded-full w-[150px]">&nbsp;</div>
      <div className="h-[40px] w-[88px] p-1 bg-slate-500/20 rounded-[8px]">
        <div className="h-full w-[44px] bg-white rounded-[8px]">&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>

    <div className="mt-8">
      <div className="h-[15px] bg-slate-500/20 rounded-full w-[100px]">&nbsp;</div>
      <div className="h-[30px] bg-slate-500/20 rounded-full w-[150px] mt-2">&nbsp;</div>
    </div>

    <hr className="my-6 bg-gray-200 h-[2px]" />

    <div className="pie-chart absolute mt-[-40px]">
    </div>

    <hr className="bg-gray-200 h-[2px] mt-[227px]" />

    <div className="mt-4 h-[28px] bg-gray-200 rounded-lg w-[50px]">
      &nbsp;
    </div>

  </div>
}