import { Title } from "@tremor/react";
import BudgetForm from "expensasaures/components/forms/BudgetForm";
import Layout from "expensasaures/components/layout/Layout";
import Head from "next/head";

const create = () => {
  return (
    <Layout>
      <Head>
        <title>Create Budget</title>
      </Head>
      <div className="mx-auto px-4 max-w-[1200px] mt-10 w-full flex flex-1 h-full">
        <div className="w-full lg:w-[50%]">
          <Title className="text-center mb-10">Create Budget</Title>
          <BudgetForm />
        </div>
        <div className="lg:w-[50%] hidden md:block h-auto lg:rounded-bl-[120px] xl:rounded-bl-[200px]"
          style={{ backgroundImage: `url(/img/create_budget.png)` }}
        >

        </div>
      </div>
    </Layout>
  );
};

export default create;

