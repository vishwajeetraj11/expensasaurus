import { Title } from "@tremor/react";
import useBudgets from "expensasaures/hooks/useBudgets";
import BudgetCard from "./BudgetCard";

const RecentBudgets = () => {
  const { data } = useBudgets();

  return (
    <>
      <Title className="mb-6">Recent Budgets</Title>
      <div className="flex flex-col gap-4">
        {data &&
          data?.documents.map((budget) => {
            return <BudgetCard key={budget.$id} {...budget} />;
          })}
      </div>
    </>
  );
};

export default RecentBudgets;
