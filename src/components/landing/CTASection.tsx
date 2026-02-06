import Link from "next/link";
import { ROUTES } from "expensasaurus/shared/constants/routes";

const CTASection = () => {
  return (
    <section className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 px-5 py-20 md:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-[1200px] rounded-3xl border border-white/25 bg-white/10 p-8 text-center shadow-[0_24px_80px_-48px_rgba(29,78,216,0.75)] backdrop-blur md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-100">
          Ready to start
        </p>
        <h3 className="mt-3 text-3xl font-bold text-white md:text-5xl">
          Build a budget system you actually stick to
        </h3>
        <p className="mx-auto mt-4 max-w-[42rem] text-base text-blue-100 md:text-lg">
          Create your account, connect your daily spend tracking, and use
          Assistant audio input to reduce manual entry.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={ROUTES.SIGNUP}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Sign up free
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
