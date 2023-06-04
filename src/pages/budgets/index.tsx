import { Button, Title } from "@tremor/react";
import clsx from "clsx";
import RecentBudgets from "expensasaures/components/budgets/RecentBudgets";
import Layout from "expensasaures/components/layout/Layout";
import useBudgets from "expensasaures/hooks/useBudgets";
import dynamic from "next/dynamic";
import Link from "next/link";
const EmptyStateBudgets = dynamic(() => import("expensasaures/components/budgets/EmptyStateBudgets"), { ssr: false });

const index = () => {
  const { data } = useBudgets();
  const emptyState = data?.total === 0;
  return (
    <Layout>
      <div className="mx-auto max-w-[1200px] w-full">
        <div className={clsx("flex items-center", emptyState ? 'justify-center' : 'justify-between')}>
          &nbsp;
          <Title className="text-center py-10">Budgets</Title>
          {!emptyState ? <Link href={"/budgets/create"}>
            <Button>Add Budget</Button>
          </Link> : null}
        </div>
        {emptyState && <EmptyStateBudgets />}
        {/* <div>Pinned budget details</div>
        <div>Recent Activity</div>
        <div>Completed budgets</div>
        <div>Failed goals</div> */}
        {!emptyState && (
          <div>
            <RecentBudgets />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default index;
