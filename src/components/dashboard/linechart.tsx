import { Card, LineChart, Subtitle, Text, Title } from "@tremor/react";
import { Models } from "appwrite";
import clsx from "clsx";

import { startOfYear, subDays } from "date-fns";
import { dataFormatterLoading } from "expensasaurus/hooks/useDates";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { demoDashboardLineChart } from "expensasaurus/shared/constants/loadingData";
import { getAllLists } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { useGlobalStore } from "expensasaurus/shared/stores/useGlobalStore";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import { useEffect, useState } from "react";

import { shallow } from "zustand/shallow";

const LineChartTabs = () => {
  const { activeMonth } = useGlobalStore();
  const [selectedPeriod, setSelectedPeriod] = useState("Max");
  const [data, setData] = useState<{ date: string; amount: number }[] | []>([]);

  const { user, userInfo } = useAuthStore(
    (state) => ({ user: state.user, userInfo: state.userInfo }),
    shallow
  ) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>;
  };
  const { data: thisMonthExpenses, isSuccess } = getAllLists<Transaction>(
    ["Expenses", "Stats this month", activeMonth, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.EXPENSES, []],
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (
      thisMonthExpenses &&
      thisMonthExpenses?.documents.length &&
      !data.length
    ) {
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
  const dataFormatter = (number: number) => {
    return formatCurrency(userInfo?.prefs?.currency, number);
  };
  return (
    <Card className="box-shadow-card">
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
};

interface PropsL {
  animate?: boolean;
}

export const LineChartTabsLoading = (props: PropsL) => {
  const { animate = true } = props;
  return (
    <div
      className={clsx(
        animate && "before:animate-[shimmer_2s_infinite]",
        "relative mb-5 w-full overflow-hidden rounded-2xl bg-white/10 p-6 shadow-xl shadow-black/5 dark:bg-slate-900/70 before:absolute before:inset-0 before:-translate-x-full before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 before:to-transparent dark:before:border-white/10 dark:before:via-slate-300/10"
      )}
    >
      <div
        className={clsx(
          "mb-2 h-[20px] w-[100px] rounded-full bg-slate-500/20 dark:bg-slate-700/70",
          animate ? "opacity-40" : "opacity-5"
        )}
      >
        &nbsp;
      </div>
      <div
        className={clsx(
          "h-[12px] w-[100px] rounded-full bg-slate-500/20 dark:bg-slate-700/55",
          animate ? "opacity-40" : "opacity-5"
        )}
      >
        &nbsp;
      </div>
      {!animate && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <Title className="mb-5 mt-[-100px]">Select a Category</Title>
          <Subtitle className="w-[80%] sm:w-[40%] text-center">
            No category selected. Please choose a category from the dropdown to
            view the corresponding chart.
          </Subtitle>
        </div>
      )}
      <LineChart
        className={clsx(
          "h-80 mt-8 z-[-1] relative",
          animate ? "opacity-40" : "opacity-5"
        )}
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
  );
};

export default LineChartTabs;
