import Navigation from "expensasaures/components/Navigation";
import Footer from "expensasaures/components/landing/footer";

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between`}
    >
      <div className="p-24">
        <Navigation landingPage />
      </div>

      <Footer />

    </main>
  );
}
