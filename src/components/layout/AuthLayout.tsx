import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import Link from "next/link";
import { shallow } from "zustand/shallow";
import DarkMode from "../ui/DarkMode";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { authFormState } = useAuthStore(
    (state) => ({
      authFormState: state.authFormState,
    }),
    shallow
  );

  const isSignup = authFormState === "SIGN_UP";

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-20 h-[20rem] w-[20rem] rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-500/12" />
        <div className="absolute right-[-10%] top-10 h-[22rem] w-[22rem] rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/16" />
      </div>

      <DarkMode />

      <main className="relative mx-auto grid min-h-[100dvh] w-full max-w-[1240px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-stretch lg:gap-12 lg:px-8 lg:py-10">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur transition-colors dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_30px_90px_-55px_rgba(2,6,23,0.95)] sm:p-8 lg:p-10">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[0.95rem] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
          >
            <svg width="9" height="12" viewBox="0 0 9 12" fill="none">
              <path
                d="M7.5 1L2.5 6L7.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Link>

          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 lg:hidden">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Expensasaurus
            </p>
            <h2 className="mt-2 max-w-[24ch] text-[1.35rem] font-semibold leading-8 text-slate-900 dark:text-white">
              {isSignup
                ? "Create a calm setup for tracking spending"
                : "Sign in to continue your budget workflow"}
            </h2>
            <p className="mt-2 max-w-[58ch] text-base leading-7 text-slate-600 dark:text-slate-300">
              {isSignup
                ? "Set a currency, capture expenses faster, and keep your monthly decisions easy to review."
                : "Pick up where you left off and get back to your budgets, transactions, and insights."
              }
            </p>
          </div>

          <div className="mt-8">{children}</div>
        </section>

        <aside className="hidden rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-10 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] transition-colors dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 dark:shadow-[0_30px_90px_-45px_rgba(15,23,42,0.9)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue-100/80 dark:text-cyan-300/80">
              Expensasaurus
            </p>
            <h2 className="mt-4 max-w-[13ch] text-[clamp(2rem,3.2vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              {isSignup
                ? "Build a steadier spending system"
                : "Welcome back to your finance workspace"}
            </h2>
            <p className="mt-4 max-w-[56ch] text-[1.02rem] leading-8 text-blue-50/88 dark:text-slate-200">
              {isSignup
                ? "Create an account to organize expenses, choose a default currency, and move faster with Assistant-supported entry."
                : "Sign in to review budgets, check recent activity, and keep your month-end spending under control."}
            </p>
          </div>

          <div className="mt-10 space-y-3">
            <div className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-200" />
              <div>
                <p className="text-[0.95rem] font-semibold text-white">
                  Clear category trends
                </p>
                <p className="mt-1 text-[0.95rem] leading-7 text-blue-50/80">
                  See where money goes without switching between dense screens.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-200" />
              <div>
                <p className="text-[0.95rem] font-semibold text-white">
                  Faster transaction entry
                </p>
                <p className="mt-1 text-[0.95rem] leading-7 text-blue-50/80">
                  Use Assistant prompts to keep logging expenses quick and precise.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-200" />
              <div>
                <p className="text-[0.95rem] font-semibold text-white">
                  Budget health at a glance
                </p>
                <p className="mt-1 text-[0.95rem] leading-7 text-blue-50/80">
                  Spot overspending early and stay confident about month-to-month plans.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
