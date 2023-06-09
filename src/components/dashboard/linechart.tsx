import { Card, LineChart, Text, Title } from "@tremor/react";
import { Models } from "appwrite";

import { startOfYear, subDays } from "date-fns";
import { dataFormatter, dataFormatterLoading } from "expensasaures/hooks/useDates";
import { ENVS } from "expensasaures/shared/constants/constants";
import { demoDashboardLineChart } from "expensasaures/shared/constants/loadingData";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { useEffect, useState } from "react";

import { shallow } from "zustand/shallow";

const LineChartTabs = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Max");
  const [data, setData] = useState<{ date: string; amount: number }[] | []>([]);

  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const { data: thisMonthExpenses, isSuccess } = getAllLists<Transaction>(
    ["Expenses", "Stats this month", user?.userId],
    [ENVS.DB_ID, "6467f98b8e8fe5ffa576", []],
    {
      enabled: false,
    }
  );

  useEffect(() => {

    if (thisMonthExpenses && thisMonthExpenses?.documents.length && !data.length) {
      const mappedData = thisMonthExpenses?.documents.map(
        (item: Transaction) => {
          const date = new Date(item.date);
          const dateResult =
            date.getDate() +
            "." +
            (date.getMonth() + 1) +
            "." +
            date.getFullYear();
          return {
            date: dateResult,
            amount: item.amount,
            category: item.category,
          };
        }
      );
      if (mappedData) {
        setData(mappedData);
      }
    }
  }, [data, thisMonthExpenses?.documents]);

  const getDate = (dateString: string) => {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split(".").map(Number);
    return new Date(year, month - 1, day);
  };

  const filterData = (startDate: Date, endDate: Date) =>
    data.filter((item) => {
      const currentDate = getDate(item.date);

      return currentDate >= startDate && currentDate <= endDate;
    });

  const getFilteredData = (period: string) => {
    const lastAvailableDate = getDate(data[data.length - 1]?.date);

    if (lastAvailableDate) {
      switch (period) {
        case "1M": {
          const periodStartDate = subDays(lastAvailableDate, 30);
          return filterData(periodStartDate, lastAvailableDate);
        }
        case "2M": {
          const periodStartDate = subDays(lastAvailableDate, 60);
          return filterData(periodStartDate, lastAvailableDate);
        }
        case "6M": {
          const periodStartDate = subDays(lastAvailableDate, 180);
          return filterData(periodStartDate, lastAvailableDate);
        }
        case "YTD": {
          const periodStartDate = startOfYear(lastAvailableDate);
          return filterData(periodStartDate, lastAvailableDate);
        }
        default:
          return data;
      }
    }
  };
  return (
    <Card
      className='box-shadow-card'
    >
      <Title>Expense</Title>
      <Text>This Month</Text>
      {isSuccess && (
        <LineChart
          className="h-80 mt-8"
          data={getFilteredData(selectedPeriod) || []}
          index="date"
          curveType="natural"
          categories={["amount"]}
          colors={["blue"]}
          valueFormatter={dataFormatter}
          showLegend={false}
          yAxisWidth={80}
          showXAxis

        />
      )}
    </Card>
  );
}

export const LineChartTabsLoading = () => {
  return <div className="relative p-6 w-full mb-5 overflow-hidden rounded-2xl bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 dark:before:via-slate-50/10  before:to-transparent">
    <div className="h-[20px] bg-slate-500/20 rounded-full w-[100px] mb-2">&nbsp;</div>
    <div className="h-[12px] bg-slate-500/20 rounded-full w-[100px]">&nbsp;</div>
    <LineChart
      className="h-80 mt-8 opacity-40 z-[-1] relative"
      data={demoDashboardLineChart}
      curveType="natural"
      index="date"
      categories={["amount"]}
      colors={["slate"]}
      valueFormatter={dataFormatterLoading}
      showLegend={false}
      yAxisWidth={60}
      showXAxis
    />
  </div>
}

export default LineChartTabs;