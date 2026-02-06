import Image from "next/image";
import { AiOutlineBarChart } from "react-icons/ai";
import { BiCategoryAlt } from "react-icons/bi";
import { GrAnalytics } from "react-icons/gr";
import { MdOutlineMoneyOffCsred } from "react-icons/md";
import { TbHeartRateMonitor } from "react-icons/tb";

const featureItems = [
  {
    icon: BiCategoryAlt,
    title: "Category Overview",
    text: "View categories, transactions, and expenses in one place.",
  },
  {
    icon: GrAnalytics,
    title: "Category Analysis",
    text: "Analyze category performance with clean chart and table views.",
  },
  {
    icon: MdOutlineMoneyOffCsred,
    title: "No Budget Categories",
    text: "Identify spending categories without defined budget limits.",
  },
  {
    icon: TbHeartRateMonitor,
    title: "Budget Status",
    text: "Monitor how close each budget is to its spending limit.",
  },
  {
    icon: () => (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 512 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M448 160H320V128H448v32zM48 64C21.5 64 0 85.5 0 112v64c0 26.5 21.5 48 48 48H464c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM448 352v32H192V352H448zM48 288c-26.5 0-48 21.5-48 48v64c0 26.5 21.5 48 48 48H464c26.5 0 48-21.5 48-48V336c0-26.5-21.5-48-48-48H48z" />
      </svg>
    ),
    title: "Progress Bar",
    text: "Visualize budget usage quickly with progress indicators.",
  },
  {
    icon: AiOutlineBarChart,
    title: "Spending vs Budget",
    text: "Compare planned budget and actual spending side by side.",
  },
];

export const BudgetManagement = () => {
  return (
    <section
      id="budget"
      className="w-full scroll-mt-[var(--navigation-height)] bg-gradient-to-b from-blue-100/70 via-blue-50/50 to-white px-5 pb-20 pt-2 md:px-8 md:pt-3 lg:pb-24 lg:pt-4"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mx-auto max-w-[46rem] text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
            Budget Management
          </p>
          <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-5xl">
            Seamless Budget Control and Analysis
          </h2>
          <p className="mt-4 text-base text-blue-900/80 md:text-lg">
            Set budget limits, track spending clearly, and pair this workflow
            with Assistant audio input for faster expense and income logging.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:p-5">
            <Image
              src="/budget.png"
              alt="Budget dashboard preview"
              width={1200}
              height={900}
              className="h-auto w-full rounded-xl"
            />
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
              <Image
                src="/budgetGraph.png"
                alt="Budget graph preview"
                width={1200}
                height={700}
                className="h-auto w-full rounded-lg"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureItems.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-700">
                  <Icon />
                </div>
                <h3 className="mt-3 text-base font-semibold text-blue-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-900/75">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
