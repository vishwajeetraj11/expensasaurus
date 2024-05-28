import { SearchSelect, SearchSelectItem, Title } from "@tremor/react";
import CategoriesPieChart, {
  CategoriesPieChartLoading,
} from "expensasaurus/components/dashboard/categorypiechart";
import LineChartTabs, {
  LineChartTabsLoading,
} from "expensasaurus/components/dashboard/linechart";
import DashboardStatistics, {
  DashboardStatisticsLoading,
} from "expensasaurus/components/dashboard/stats";
import Layout from "expensasaurus/components/layout/Layout";
import React, { useEffect } from "react";
import { messaging } from "../firebase";
import useDashboard from "expensasaurus/hooks/useDashboard";
import { useDynamicDates } from "expensasaurus/hooks/useDates";
import { months } from "expensasaurus/shared/constants/constants";
import { useGlobalStore } from "expensasaurus/shared/stores/useGlobalStore";
import Head from "next/head";

const dashboard = () => {
  const { setActiveMonth, activeMonth } = useGlobalStore();

  const onMonthChange = (val: string) => {
    setActiveMonth(val);
  };

  const {
    endOfEarlierMonth,
    endOfTheMonth,
    startOfEarlierMonth,
    startOfTheMonth,
  } = useDynamicDates(activeMonth);

  const {
    statistics,
    incomeThisMonth,
    expenseThisMonth,
    expensesAndPercentByCategoryThisMonth,
    isLoading,
  } = useDashboard({
    endOfEarlierMonth,
    endOfTheMonth,
    startOfEarlierMonth,
    startOfTheMonth,
  });

   useEffect(() => {
     messaging
       .requestPermission()
       .then(() => {
         return messaging.getToken();
       })
       .then((Token) => {
         console.log("Token:", token);
       })
       .catch((error) => {
         console.error("Error:", error);
       });
   }, []);

  // const isLoading = true;
  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Monthly Performance Dashboard</title>
      </Head>
      <main className="max-w-[1200px] w-full mx-auto pt-10 px-4">
        <div className="flex justify-between mb-10">
          <Title className="font-thin text-left">
            Monthly Performance Dashboard
          </Title>
          <div className="">
            <SearchSelect value={activeMonth} onValueChange={onMonthChange}>
              {months.map((month, index) => (
                <SearchSelectItem key={index} value={month}>
                  {month}
                </SearchSelectItem>
              ))}
            </SearchSelect>
          </div>
        </div>
        {isLoading ? (
          <DashboardStatisticsLoading />
        ) : (
          <DashboardStatistics stats={statistics} />
        )}

        <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
          <div className="w-full md:w-[66%]">
            {isLoading ? (
              <>
                <LineChartTabsLoading />
              </>
            ) : (
              <LineChartTabs />
            )}
          </div>
          <div className="w-full md:w-[32%]">
            {isLoading ? (
              <CategoriesPieChartLoading />
            ) : (
              <CategoriesPieChart
                incomeThisMonth={incomeThisMonth}
                expensesAndPercentByCategoryThisMonth={
                  expensesAndPercentByCategoryThisMonth
                }
                expenseThisMonth={expenseThisMonth}
              />
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default dashboard;
