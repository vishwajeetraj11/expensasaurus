import { CheckCircleIcon, ExclamationIcon } from "@heroicons/react/outline";
import clsx from "clsx";

interface BudgetStatusProps {
  type: "fail" | "success" | "on-track";
  categoryExceed: boolean;
  categoryWithNoBudget: boolean;
}

const BudgetStatus = (props: BudgetStatusProps) => {
  const { type, categoryExceed, categoryWithNoBudget } = props;
  const isFail = type === "fail";
  const isSuccess = type === "success";
  const isOnTrack = type === "on-track";

  const title = isOnTrack
    ? "Budget Update"
    : isSuccess
    ? "Budget Success"
    : "Budget Exceeded";

  const Icon = isOnTrack
    ? CheckCircleIcon
    : isSuccess
    ? CheckCircleIcon
    : ExclamationIcon;
  const highlights = [
    categoryExceed ? "One or more categories are above budget." : null,
    categoryWithNoBudget ? "Some spending was logged in categories without a budget." : null,
  ].filter(Boolean) as string[];

  const summary = highlights.length
    ? highlights.join(" ")
    : isSuccess
    ? "Great control across your budgeted categories."
    : "Your spending is currently in a healthy range.";

  const actions = isFail
    ? [
        categoryExceed
          ? "Review overspent categories and either reduce upcoming spend or update limits."
          : null,
        categoryWithNoBudget
          ? "Assign budget caps to uncapped categories to prevent surprise overruns."
          : null,
        "Check recent transactions and move non-essential expenses to lower-priority categories.",
      ]
    : isSuccess
    ? [
        "Keep the same spending pace for the rest of this budget period.",
        "Use any surplus to strengthen savings or pay down high-priority goals.",
      ]
    : [
        "Do a quick weekly review to catch spikes before they turn into overruns.",
        "Reallocate budget between categories based on actual usage.",
      ];

  const panelClasses = isFail
    ? "border-rose-300/80 bg-rose-50 text-rose-900 dark:border-rose-500/35 dark:bg-rose-500/12 dark:text-rose-100"
    : isSuccess
    ? "border-emerald-300/80 bg-emerald-50 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-100"
    : "border-blue-300/80 bg-blue-50 text-blue-900 dark:border-blue-500/35 dark:bg-blue-500/12 dark:text-blue-100";

  const iconClasses = isFail
    ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
    : isSuccess
    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
    : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300";

  return (
    <div className={clsx("mt-10 rounded-2xl border p-5 shadow-sm", panelClasses)}>
      <div className="flex items-start gap-3">
        <span className={clsx("mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconClasses)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 opacity-95">{summary}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 opacity-95">
            {actions.filter(Boolean).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetStatus;
