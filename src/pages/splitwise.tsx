import Head from "next/head";
import Layout from "expensasaurus/components/layout/Layout";
import SplitwiseAnalyzerView from "expensasaurus/features/splitwise/SplitwiseAnalyzerView";

const SplitwisePage = () => {
  return (
    <Layout disablePadding>
      <Head>
        <title>Expensasaurus - Splitwise</title>
      </Head>
      <SplitwiseAnalyzerView />
    </Layout>
  );
};

export default SplitwisePage;
