import BudgetByIDPage from "expensasaures/components/budgets/BudgetByIDPage";
import Layout from "expensasaures/components/layout/Layout";
import Head from "next/head";

const id = () => {

  return (
    <Layout>
      <Head>
        <title>Expensasaures - Analysis of an Individual Budget</title>
      </Head>
      <BudgetByIDPage />
    </Layout>
  );
};

export default id;
