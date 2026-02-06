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
import { categories } from "expensasaurus/shared/constants/categories";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { CategoryData } from "expensasaurus/shared/utils/calculation";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
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

const getDeltaBadgeClassName = (deltaType: DeltaType) => {
  switch (deltaType) {
    case "increase":
    case "moderateIncrease":
      return "!bg-emerald-100 !text-emerald-900 !ring-1 !ring-emerald-200";
    case "decrease":
    case "moderateDecrease":
      return "!bg-rose-100 !text-rose-900 !ring-1 !ring-rose-200";
    default:
      return "!bg-slate-100 !text-slate-900 !ring-1 !ring-slate-200";
  }
};



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
                <Bold className="text-slate-700 dark:text-slate-200">Category</Bold>
              </Text>
              <Text className="text-slate-700 dark:text-slate-200">Increase from last month</Text>
            </Flex>
            <List className="mt-4">
              {categoryExpense.map((category) => {
                return (
                  <ListItem key={category.name}>
                    <Text className="font-medium text-slate-700 dark:text-slate-200">{category.name}</Text>
                    <Flex justifyContent="end" className="space-x-2">
                      <Text className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(userInfo?.prefs?.currency, category.value)}
                      </Text>
                      <BadgeDelta
                        deltaType={category.deltaType}
                        size="xs"
                        className={getDeltaBadgeClassName(category.deltaType)}
                      >
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
        <Link href={ROUTES.CATEGORY} shallow>
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
  return <div className="relative mb-5 w-full overflow-hidden rounded-2xl bg-white/10 p-6 shadow-xl shadow-black/5 dark:bg-slate-900/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 before:to-transparent dark:before:border-white/10 dark:before:via-slate-300/10">
    <div className="flex items-center justify-between">
      <div className="h-[28px] w-[150px] rounded-full bg-slate-500/20 dark:bg-slate-700/70">&nbsp;</div>
      <div className="h-[40px] w-[88px] rounded-[8px] bg-slate-500/20 p-1 dark:bg-slate-700/60">
        <div className="h-full w-[44px] rounded-[8px] bg-white dark:bg-slate-600">&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>

    <div className="mt-8">
      <div className="h-[15px] w-[100px] rounded-full bg-slate-500/20 dark:bg-slate-700/70">&nbsp;</div>
      <div className="mt-2 h-[30px] w-[150px] rounded-full bg-slate-500/20 dark:bg-slate-700/60">&nbsp;</div>
    </div>

    <hr className="my-6 h-[2px] bg-gray-200 dark:bg-white/10" />

    <div className="pie-chart absolute mt-[-40px] dark:hidden">
    </div>
    <div className="absolute mt-[-18px] hidden h-[210px] w-[210px] rounded-full border border-white/10 bg-slate-800/70 dark:block" />

    <hr className="mt-[227px] h-[2px] bg-gray-200 dark:bg-white/10" />

    <div className="mt-4 h-[28px] w-[50px] rounded-lg bg-gray-200 dark:bg-slate-700">
      &nbsp;
    </div>

  </div>
}
