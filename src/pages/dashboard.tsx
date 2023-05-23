import CategoriesPieChart from "expensasaures/components/dashboard/categorypiechart";
import LineChartTabs from "expensasaures/components/dashboard/linechart";
import DashboardStatistics from "expensasaures/components/dashboard/stats";
import Layout from "expensasaures/components/layout/Layout";
import useDashboard from "expensasaures/hooks/useDashboard";

const dashboard = () => {
  const {
    statistics,
    incomeThisMonth,
    expenseThisMonth,
    expensesAndPercentByCategoryThisMonth,
  } = useDashboard();

  return (
    <Layout>
      <main className="dark:bg-navy-900 min-h-[100vh]">
        <div className="max-w-[1200px] mx-auto pt-10">
          <DashboardStatistics stats={statistics} />
          <div className="flex justify-between gap-4 mt-8">
            <div className="w-[66%]">
              <LineChartTabs />
            </div>
            <div className="w-[32%]">
              <CategoriesPieChart
                incomeThisMonth={incomeThisMonth}
                expensesAndPercentByCategoryThisMonth={
                  expensesAndPercentByCategoryThisMonth
                }
                expenseThisMonth={expenseThisMonth}
              />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default dashboard;
