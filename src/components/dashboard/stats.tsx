import { Card, Flex, Grid, Metric, Text } from "@tremor/react";
import {
  Models
} from 'appwrite';
import { dashboardStatColors } from "expensasaurus/shared/constants/constants";
import { useAuthStore } from 'expensasaurus/shared/stores/useAuthStore';
import { DashboardStat } from "expensasaurus/shared/types/transaction";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import { shallow } from 'zustand/shallow';
import DeltaIcon from "./dashboardStatBadge";
interface Props {
  stats: DashboardStat[];
}

const DashboardStatistics = (props: Props) => {
  const { stats } = props;
  const { user, userInfo } = useAuthStore((state) => ({ user: state.user, userInfo: state.userInfo }), shallow) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>;
  };
  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
      {stats.map((item) => {
        const isExpense = item.title === "Expenses";
        const isSavings = item.title === "Savings";
        const isIncome = item.title === "Income";
        return (
          (
            <Card className='box-shadow-card' key={item.title}>
              <Text className="text-stone-600 font-medium">{item.title}</Text>
              <Flex
                justifyContent="start"
                alignItems="baseline"
                className="truncate space-x-3"
              >
                <Metric className="text-slate-950">{item.metric}</Metric>
                {item.metricPrev && (
                  <Text className="truncate">from {item.metricPrev}</Text>
                )}
              </Flex>

              <Flex justifyContent="start" className="space-x-2 mt-4">
                {item.deltaType &&
                  <DeltaIcon change={item.change} resource={isExpense ? 'expense' : isIncome ? 'income' : 'saving'} deltaType={item.deltaType} />
                }
                <Flex justifyContent="start" className="space-x-1 truncate">
                  {item.delta && (
                    <Text color={dashboardStatColors[item.deltaType]}>
                      {item.delta === '0%' ? formatCurrency(userInfo?.prefs?.currency, isExpense ? Math.abs(item.change) : item.change) : item.delta}
                    </Text>
                  )}
                  <Text className="truncate"> to previous month </Text>
                </Flex>
              </Flex>
            </Card>
          )
        )
      })}
    </Grid>
  );
};

const Skeleton = () => {
  return <div className="h-[144px] p-6 w-full relative overflow-hidden rounded-2xl bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 before:to-transparent">
    <div className="h-[15px] bg-slate-500/20 rounded-full w-[100px] mb-2">&nbsp;</div>
    <div className="flex items-end mt-4">
      <div className="h-[20px] bg-slate-500/20 rounded-full w-[100px]">&nbsp;</div>
      <div className="h-[10px] bg-slate-400/20 rounded-full w-[100px] ml-2">&nbsp;</div>
    </div>
    <div className="flex mt-4 items-center gap-2">
      <div className="h-[20px] w-[40px] bg-slate-500/20 rounded-full">&nbsp;</div>
      <div className="h-[10px] bg-slate-500/20 rounded-full w-[100px]">&nbsp;</div>
    </div>
  </div>
}

export const DashboardStatisticsLoading = () => {
  return <div className="flex gap-6">
    <Skeleton />
    <Skeleton />
    <Skeleton />
  </div>
}

export default DashboardStatistics;
