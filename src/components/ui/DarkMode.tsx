import { isBrowser } from "expensasaurus/shared/utils/common";
import React, { useEffect } from "react";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const DarkMode = (props: ButtonProps) => {
  const { ...rest } = props;
  const [darkmode, setDarkmode] = React.useState(() => {
    if (!isBrowser) return false;
    return (
      localStorage.getItem("dark") === "true" ||
      document.body.classList.contains("dark")
    );
  });

  useEffect(() => {
    document.body.classList.toggle("dark", darkmode);
    localStorage.setItem("dark", String(darkmode));
  }, [darkmode]);

  return (
    <button
      type="button"
      aria-label={`Switch to ${darkmode ? "light" : "dark"} mode`}
      title={`Switch to ${darkmode ? "light" : "dark"} mode`}
      aria-pressed={darkmode}
      className="fixed bottom-6 right-6 z-[99] inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/90 px-2 py-2 text-slate-700 shadow-[0_16px_35px_-24px_rgba(15,23,42,0.85)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-white/30 dark:hover:text-white"
      onClick={() => {
        setDarkmode((prev) => !prev);
      }}
      {...rest}
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition ${
          darkmode
            ? "bg-gradient-to-br from-blue-400 to-blue-300 text-white"
            : "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
        }`}
      >
        {darkmode ? (
          <RiSunFill className="h-4 w-4" />
        ) : (
          <RiMoonFill className="h-4 w-4" />
        )}
      </span>
      <span className="pr-1 text-xs font-semibold tracking-wide">
        {darkmode ? "Light" : "Dark"}
      </span>
    </button>
  );
}

export default DarkMode
