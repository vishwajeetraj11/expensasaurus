import Head from "next/head";
import Layout from "expensasaurus/components/layout/Layout";
import SplitwiseAnalyzerView from "expensasaurus/features/splitwise/SplitwiseAnalyzerView";
import {
  FEATURE_FLAGS,
  ROUTES,
} from "expensasaurus/shared/constants/routes";
import { useRouter } from "next/router";
import { useEffect } from "react";

const SplitwisePage = () => {
  const router = useRouter();

  useEffect(() => {
    if (!FEATURE_FLAGS.SPLITWISE) {
      void router.replace(ROUTES.DASHBOARD);
    }
  }, [router]);

  if (!FEATURE_FLAGS.SPLITWISE) {
    return null;
  }

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
