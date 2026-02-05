import clsx from "clsx";
import React, { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  submitting?: boolean;
};

const Button = ({
  size = "md",
  variant = "primary",
  loading,
  submitting,
  className,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || loading || submitting;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:focus-visible:ring-white/20",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-2.5 text-sm",
        variant === "primary" &&
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/30",
        variant === "ghost" &&
          "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
        isDisabled && "cursor-not-allowed opacity-60",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
