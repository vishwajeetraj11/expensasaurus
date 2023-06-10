import { BarChart, Card, Title } from "@tremor/react";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { formatCurrency } from "expensasaures/shared/utils/currency";
import { shallow } from "zustand/shallow";

const chartdata2 = [
  {
    topic: "Business",
    budget: 2000,
    spending: 900,
  },
  {
    topic: "Entertainment",
    budget: 4000,
    spending: 1000,
  },
];



interface Props {
  data: {
    topic: string;
    budget: number;
    spending: number;
  }[];
}

const EBarChart = (props: Props) => {
  const { data } = props;
  const { userInfo } = useAuthStore((store) => ({ userInfo: store.userInfo }), shallow)
  const dataFormatter = (number: number) => {
    return formatCurrency(userInfo?.prefs?.currency, number)
  };
  return (
    <Card className="mt-10">
      <Title>Budget Graph</Title>
      <BarChart
        className="mt-6 min-h-[500px]"
        data={data}
        index="topic"
        categories={["budget", "spending"]}
        colors={["blue", "teal", "amber", "rose", "indigo", "emerald"]}
        valueFormatter={dataFormatter}
        yAxisWidth={100}
      />
    </Card>
  );
};

export default EBarChart;
