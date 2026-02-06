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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-20 h-[20rem] w-[20rem] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-10%] top-10 h-[22rem] w-[22rem] rounded-full bg-blue-200/45 blur-3xl" />
      </div>

      <DarkMode />

      <main className="relative mx-auto grid min-h-screen w-full max-w-[1240px] grid-cols-1 gap-8 px-5 py-8 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12 lg:px-0">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur md:p-8 lg:p-10">
          <Link
            href={ROUTES.HOME}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
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
          {children}
        </section>

        <aside className="hidden rounded-3xl bg-slate-900 p-10 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.9)] lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Expensasaurus
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            {isSignup
              ? "Build your spending system with clear budgets"
              : "Welcome back to your finance command center"}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-200">
            {isSignup
              ? "Create your account to track every expense, plan categories, and start using Assistant for faster entry."
              : "Sign in to review your dashboard, update budgets, and keep monthly spending on track."}
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              Real-time dashboard with category-level trends
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              Assistant prompts to structure transactions quickly
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              Budget health signals to avoid overspending
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
