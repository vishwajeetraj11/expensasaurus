import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "expensasaurus/shared/constants/routes";

const stats = [
  { label: "Transactions logged", value: "1000+" },
  { label: "Budget categories", value: "Custom" },
  { label: "Assistant mode", value: "Audio input" },
];

const Header = () => {
  return (
    <header className="relative w-full overflow-hidden bg-gradient-to-b from-blue-100 via-blue-50 to-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-15%] top-20 h-[22rem] w-[22rem] rounded-full bg-cyan-300/45 blur-3xl" />
        <div className="absolute right-[-10%] top-0 h-[24rem] w-[24rem] rounded-full bg-blue-300/45 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1200px] gap-12 px-5 pb-20 pt-[8.5rem] md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-0 lg:pb-24">
        <div className="flex flex-col justify-center">
          <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-800 shadow-sm">
            New: Assistant audio logging
          </p>

          <h1 className="text-4xl font-bold leading-tight text-blue-950 md:text-6xl">
            Personal finance that feels
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {" "}
              effortless
            </span>
            .
          </h1>

          <p className="mt-6 max-w-[42rem] text-base leading-relaxed text-blue-900/80 md:text-lg">
            Expensasaurus helps you plan budgets and track spending. Assistant
            now takes audio input so logging expenses and income is faster with
            less manual typing.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.SIGNUP}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create free account
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:text-blue-800"
            >
              Log in
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-blue-200/90 bg-blue-50/80 px-4 py-3 shadow-sm"
              >
                <p className="text-lg font-semibold text-blue-900">{stat.value}</p>
                <p className="text-xs text-blue-700">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              Secure auth
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              Fast onboarding
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              Audio-assisted logging
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[33rem]">
          <div className="absolute -left-6 -top-5 hidden rounded-xl border border-cyan-200 bg-blue-50/95 px-3 py-2 text-xs font-medium text-blue-800 shadow-md md:block">
            Assistant: voice note to expense entry
          </div>
          <div className="absolute -bottom-5 right-0 hidden rounded-xl border border-blue-200 bg-blue-50/95 px-3 py-2 text-xs font-medium text-blue-800 shadow-md md:block">
            Faster income and expense logging
          </div>

          <div className="rounded-3xl border border-blue-200/80 bg-blue-50/50 p-3 shadow-[0_24px_70px_-34px_rgba(29,78,216,0.5)]">
            <Image
              height={820}
              width={1200}
              alt="Expensasaurus dashboard preview"
              priority
              className="h-auto w-full rounded-2xl"
              src="/dashboard.png"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
