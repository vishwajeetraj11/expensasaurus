import clsx from "clsx";
import React from "react";

type TextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  error?: boolean;
  errorMessage?: string | false;
  icon?: React.ReactNode | (() => React.ReactNode);
  containerClassName?: string;
};

const TextInput = ({
  error,
  errorMessage,
  icon,
  className,
  containerClassName,
  disabled,
  ...rest
}: TextInputProps) => {
  const iconNode = typeof icon === "function" ? icon() : icon;

  return (
    <div className={clsx("w-full", containerClassName)}>
      <div className="relative">
        {iconNode && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500 dark:text-slate-300">
            {iconNode}
          </span>
        )}
        <input
          {...rest}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={clsx(
            "w-full rounded-xl border bg-white/90 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition",
            "placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10",
            "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-white/30 dark:focus:ring-white/10",
            iconNode && "pl-10",
            error &&
              "border-rose-500 text-rose-600 placeholder:text-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
            disabled && "cursor-not-allowed opacity-60",
            className
          )}
        />
      </div>
      {errorMessage && (
        <p className="mt-1.5 text-xs text-rose-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default TextInput;
