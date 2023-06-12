import Navigation from "expensasaurus/components/Navigation";
import CTASection from "expensasaurus/components/landing/CTASection";
import { BudgetManagement } from "expensasaurus/components/landing/budgetmanagement";
import Footer from "expensasaurus/components/landing/footer";
import Header from "expensasaurus/components/landing/header";
import HowItWorks from "expensasaurus/components/landing/howitworks";
import MainLayout from "expensasaurus/components/layout/MainLayout";
import Head from "next/head";

export default function Home() {
  return (
    <MainLayout>
      <Head>
        <meta name="description" content="Track and manage your finances effortlessly with Expensasaurus. Take control of your budget, monitor spending, and achieve your financial goals." />
        <meta name="keywords" content="expense tracker, budget management, financial planning, personal finance" />
        <meta name="author" content="Vishwajeet Raj" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Expensasaurus - Track and Manage Your Finances" />
        <meta property="og:description" content="Track and manage your finances effortlessly with Expensasaurus. Take control of your budget, monitor spending, and achieve your financial goals." />
        <meta property="og:image" content="https://cloud.appwrite.io/v1/storage/buckets/647581bae5f8d8dac87f/files/64861233ae623b136b44/view?project=645fde38a1fc2e10a9a7&mode=admin" />
        <meta property="og:url" content="https://expensasaurus.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Expensasaurus" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Expensasaurus" />
        <meta name="twitter:title" content="Expensasaurus - Track and Manage Your Finances" />
        <meta name="twitter:description" content="Track and manage your finances effortlessly with Expensasaurus. Take control of your budget, monitor spending, and achieve your financial goals." />
        <meta name="twitter:image" content="https://cloud.appwrite.io/v1/storage/buckets/647581bae5f8d8dac87f/files/64861233ae623b136b44/view?project=645fde38a1fc2e10a9a7&mode=admin" />
        <title>Expensasaurus - Track and Manage Your Finances</title>
      </Head>
      <main
        className={`flex min-h-screen flex-col items-center justify-between`}
      >
        <div className="pt-navigation-height">
          <Navigation landingPage />
        </div>
        <Header />
        <HowItWorks />
        <BudgetManagement />
        <CTASection />
        <Footer />
      </main>
    </MainLayout>
  );
}
