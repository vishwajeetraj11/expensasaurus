import BudgetByIDPage from "expensasaurus/components/budgets/BudgetByIDPage";
import Layout from "expensasaurus/components/layout/Layout";
import Head from "next/head";

const id = () => {

  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Analysis of an Individual Budget</title>
      </Head>
      <BudgetByIDPage />
    </Layout>
  );
};

export default id;
