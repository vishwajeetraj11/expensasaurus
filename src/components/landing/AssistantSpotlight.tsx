import Link from "next/link";
import { LANDING_SECTIONS, ROUTES } from "expensasaurus/shared/constants/routes";

const prompts = [
  "Voice input: Grocery 32 dollars today",
  "Voice input: Salary credited 2400 this month",
  "Voice input: Auto fare 14 dollars transport",
];

const AssistantSpotlight = () => {
  return (
    <section
      id={LANDING_SECTIONS.ASSISTANT.slice(1)}
      className="w-full scroll-mt-[var(--navigation-height)] bg-gradient-to-b from-blue-200/60 via-blue-100/70 to-white px-5 pb-20 pt-2 text-slate-900 md:px-8 md:pt-3 lg:pb-24 lg:pt-4"
    >
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Assistant
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-blue-950 md:text-5xl">
            Log expenses and income from audio input
          </h2>
          <p className="mt-4 max-w-[38rem] text-base leading-relaxed text-blue-900/80 md:text-lg">
            Speak your transaction details. Assistant helps convert that audio
            input into structured entries so you can review and log faster.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.SIGNUP}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try it in your account
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:text-blue-800"
            >
              Log in to continue
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
            Prompt examples
          </p>

          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div
                key={prompt}
                className="rounded-xl border border-blue-100 bg-white p-3 text-sm text-blue-900/80"
              >
                “{prompt}”
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-100/70 p-3 text-sm text-blue-900">
            <p className="inline-flex items-center gap-2 font-semibold">
              Built for expenses and income logging
            </p>
            <p className="mt-1 text-blue-900/75">
              Use voice input for faster capture, then confirm the details
              before saving.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssistantSpotlight;
