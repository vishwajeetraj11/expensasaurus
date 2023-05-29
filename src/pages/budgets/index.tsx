import { Button, Title } from "@tremor/react";
import RecentBudgets from "expensasaures/components/budgets/RecentBudgets";
import Layout from "expensasaures/components/layout/Layout";
import useBudgets from "expensasaures/hooks/useBudgets";
import Link from "next/link";

const index = () => {
  const { data } = useBudgets();

  return (
    <Layout>
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between">
          &nbsp;
          <Title className="text-center py-10">Budgets</Title>
          <Link href={"/budgets/create"}>
            <Button>Add Budget</Button>
          </Link>
        </div>
        <div>Pinned budget details</div>
        <div>Recent Activity</div>
        <div>Completed budgets</div>
        <div>Failed goals</div>
        {data && (
          <div>
            <RecentBudgets />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default index;
