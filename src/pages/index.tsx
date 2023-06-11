import Navigation from "expensasaures/components/Navigation";
import CTASection from "expensasaures/components/landing/CTASection";
import { BudgetManagement } from "expensasaures/components/landing/budgetmanagement";
import Footer from "expensasaures/components/landing/footer";
import Header from "expensasaures/components/landing/header";
import HowItWorks from "expensasaures/components/landing/howitworks";
import MainLayout from "expensasaures/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
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
