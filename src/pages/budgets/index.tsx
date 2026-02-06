import { Button, Title } from "@tremor/react";
import clsx from "clsx";
import RecentBudgets from "expensasaurus/components/budgets/RecentBudgets";
import Layout from "expensasaurus/components/layout/Layout";
import Lottie from "expensasaurus/components/ui/Lottie";
import useBudgets from "expensasaurus/hooks/useBudgets";
import animationData from "expensasaurus/lottie/searchingDocs.json";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { defaultOptions } from "expensasaurus/shared/utils/lottie";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
const EmptyStateBudgets = dynamic(() => import("expensasaurus/components/budgets/EmptyStateBudgets"), { ssr: false });

const index = () => {
  const { data, isLoading } = useBudgets();
  const loaderSize = 260;

  const emptyState = data?.total === 0;

  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Set and Monitor Your Budgets</title>
      </Head>
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-16">
        <div className={clsx("flex items-center", emptyState ? 'justify-center' : 'justify-between')}>
          &nbsp;
          <Title className="py-10 text-center text-slate-900 dark:text-slate-100">Budgets</Title>
          {!emptyState ? <Link href={ROUTES.BUDGET_CREATE}>
            <Button>Add Budget</Button>
          </Link> : null}
        </div>
        {emptyState && !isLoading && <EmptyStateBudgets />}
        {isLoading && (
          <div className="mx-auto w-full max-w-[260px]">
            <Lottie
              options={defaultOptions(animationData)}
              height={loaderSize}
              width={loaderSize}
            />
          </div>
        )}
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
