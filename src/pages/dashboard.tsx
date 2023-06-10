import { Title } from "@tremor/react";
import CategoriesPieChart, { CategoriesPieChartLoading } from "expensasaures/components/dashboard/categorypiechart";
import LineChartTabs, { LineChartTabsLoading } from "expensasaures/components/dashboard/linechart";
import DashboardStatistics, { DashboardStatisticsLoading } from "expensasaures/components/dashboard/stats";
import Layout from "expensasaures/components/layout/Layout";
import useDashboard from "expensasaures/hooks/useDashboard";

const dashboard = () => {
  const {
    statistics,
    incomeThisMonth,
    expenseThisMonth,
    expensesAndPercentByCategoryThisMonth,
    isLoading,
  } = useDashboard();

  // const isLoading = true;
  return (
    <Layout>
      <main className="max-w-[1200px] w-full mx-auto pt-10 px-4">
        <Title className="font-thin text-center mb-10">Monthly Performance Dashboard</Title>
        {isLoading ? <DashboardStatisticsLoading /> : <DashboardStatistics stats={statistics} />}

        <div className="flex justify-between gap-4 mt-8">
          <div className="w-[66%]">
            {isLoading ? <>
              <LineChartTabsLoading />
            </> : <LineChartTabs />}

          </div>
          <div className="w-[32%]">

            {isLoading ? <CategoriesPieChartLoading /> : <CategoriesPieChart
              incomeThisMonth={incomeThisMonth}
              expensesAndPercentByCategoryThisMonth={
                expensesAndPercentByCategoryThisMonth
              }
              expenseThisMonth={expenseThisMonth}
            />}
          </div>
        </div>

      </main>
    </Layout>
  );
};

export default dashboard;
