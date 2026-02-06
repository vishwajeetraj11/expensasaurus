import { Title } from "@tremor/react";
import IncomeForm from "expensasaurus/components/forms/IncomeForm";
import Layout from "expensasaurus/components/layout/Layout";
import Head from "next/head";

const create = () => {
  return (
    <Layout>
      <Head>
        <title>Update Income</title>
      </Head>
      <div className="mx-auto mt-10 flex h-full w-full max-w-[1200px] flex-1 gap-8 px-4 pb-10">
        <div className="w-full lg:w-[50%]">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_30px_90px_-65px_rgba(0,0,0,0.95)] sm:p-6">
            <Title className="mb-8 text-center text-slate-900 dark:text-slate-100">
              Add Income
            </Title>
            <IncomeForm />
          </div>
        </div>
        <div
          className="relative hidden h-auto overflow-hidden rounded-3xl border border-slate-200/60 bg-cover bg-center bg-no-repeat shadow-[0_30px_80px_-60px_rgba(15,23,42,0.4)] dark:border-white/10 dark:shadow-[0_30px_90px_-65px_rgba(0,0,0,0.95)] md:block lg:w-[50%]"
          style={{ backgroundImage: "url(/img/create_budget.png)" }}
        >
          <div className="absolute inset-0 bg-white/15 dark:bg-slate-950/45" />
        </div>
      </div>

    </Layout>
  );
};

export default create;
