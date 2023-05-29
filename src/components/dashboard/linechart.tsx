import { Card, LineChart, Text, Title } from "@tremor/react";
import { Models } from "appwrite";

import { startOfYear, subDays } from "date-fns";
import { dataFormatter } from "expensasaures/hooks/useDates";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { useEffect, useState } from "react";

import { shallow } from "zustand/shallow";

export default function LineChartTabs() {
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
    if (!data.length) {
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
    <Card>
      <Title>Expense</Title>
      <Text>This Month</Text>
      {/* <TabList
        defaultValue={selectedPeriod}
        onValueChange={(value) => setSelectedPeriod(value)}
        className="mt-10"
      >
        <Tab value="1M" text="1M" />
        <Tab value="2M" text="2M" />
        <Tab value="6M" text="6M" />
        <Tab value="YTD" text="YTD" />
        <Tab value="Max" text="Max" />
      </TabList> */}
      {isSuccess && (
        <LineChart
          className="h-80 mt-8"
          data={getFilteredData(selectedPeriod) || []}
          index="date"
          categories={["amount"]}
          colors={["blue"]}
          valueFormatter={dataFormatter}
          showLegend={false}
          yAxisWidth={60}
          showXAxis
        />
      )}
    </Card>
  );
}
