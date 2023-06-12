import { Button, Title } from "@tremor/react";
import clsx from "clsx";
import RecentBudgets from "expensasaurus/components/budgets/RecentBudgets";
import Layout from "expensasaurus/components/layout/Layout";
import useBudgets from "expensasaurus/hooks/useBudgets";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
const EmptyStateBudgets = dynamic(() => import("expensasaurus/components/budgets/EmptyStateBudgets"), { ssr: false });

const index = () => {
  const { data, isLoading } = useBudgets();

  const emptyState = data?.total === 0;

  return (
    <Layout>
      <Head>
        <title>expensasaurus - Set and Monitor Your Budgets</title>
      </Head>
      <div className="mx-auto max-w-[1200px] w-full px-4">
        <div className={clsx("flex items-center", emptyState ? 'justify-center' : 'justify-between')}>
          &nbsp;
          <Title className="text-center py-10">Budgets</Title>
          {!emptyState ? <Link href={"/budgets/create"}>
            <Button>Add Budget</Button>
          </Link> : null}
        </div>
        {emptyState && !isLoading && <EmptyStateBudgets />}
        {isLoading && <></>}
        {!emptyState && !isLoading && (
          <div>
            <RecentBudgets />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default index;
