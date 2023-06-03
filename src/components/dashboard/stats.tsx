import { BadgeDelta, Card, Flex, Grid, Metric, Text } from "@tremor/react";
import { dashboardStatColors } from "expensasaures/shared/constants/constants";
import { DashboardStat } from "expensasaures/shared/types/transaction";

interface Props {
  stats: DashboardStat[];
}

const DashboardStatistics = (props: Props) => {
  const { stats } = props;
  return (
    <Grid numColsSm={2} numColsLg={3} className="gap-6">
      {stats.map((item) => (
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
            {item.deltaType && <BadgeDelta deltaType={item.deltaType} />}
            <Flex justifyContent="start" className="space-x-1 truncate">
              {item.delta && (
                <Text color={dashboardStatColors[item.deltaType]}>
                  {item.delta}
                </Text>
              )}
              <Text className="truncate"> to previous month </Text>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};

export default DashboardStatistics;
