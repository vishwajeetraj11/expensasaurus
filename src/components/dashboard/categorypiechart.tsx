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
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { CategoryData } from "expensasaures/shared/utils/calculation";
import { formatCurrency } from "expensasaures/shared/utils/currency";
import Link from "next/link";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";

interface StockData {
  name: string;
  value: number;
  performance: number;
  deltaType: DeltaType;
  absValuePrev: number;
  absValueCurr: number;
}



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
  const [categoryExpense, setCategoryExpense] = useState<StockData[] | []>([]);

  const { userInfo } = useAuthStore((store) => ({ userInfo: store.userInfo }), shallow)

  const valueFormatter = (number: number) => formatCurrency(userInfo?.prefs.currency, number);

  useEffect(() => {
    const stats: StockData[] = [];

    if (expensesAndPercentByCategoryThisMonth) {
      Object.entries(expensesAndPercentByCategoryThisMonth).forEach(
        ([key, value]) => {
          const percent = value.percentageChange;
          stats.push({
            absValuePrev: value.absolutePrevValue,
            absValueCurr: value.absoluteCurrValue,
            name: categories.find((category) => category.key === key)?.category || "",
            value: value.totalExpenses,
            performance: value.percentageChange,
            deltaType:
              percent === 0 && value.absolutePrevValue === 0 && value.absoluteCurrValue !== 0 ? 'increase' : percent > 30
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
    setCategoryExpense(stats);
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
        <Metric>{formatCurrency(userInfo?.prefs?.currency, incomeThisMonth - expenseThisMonth)}</Metric>
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
              <Text>Increase from last month</Text>
            </Flex>
            <List className="mt-4">
              {categoryExpense.map((category) => {
                return (
                  <ListItem key={category.name}>
                    <Text className="font-medium text-stone-500">{category.name}</Text>
                    <Flex justifyContent="end" className="space-x-2">
                      <Text className="font-medium text-stone-700">
                        {formatCurrency(userInfo?.prefs?.currency, category.value)}
                      </Text>
                      <BadgeDelta deltaType={category.deltaType} size="xs">
                        {/* {category.performance > 100 ? formatCurrency(userInfo?.prefs.currency, category.absValuePrev) : category.performance.toFixed(2) + "%"} */}
                        {category.absValuePrev === 0 ? formatCurrency(userInfo?.prefs.currency, category.absValueCurr) : category.performance.toFixed(2) + "%"}
                        {/* {category.performance.toFixed(2) + "%"} */}
                      </BadgeDelta>
                    </Flex>
                  </ListItem>
                )
              })}
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