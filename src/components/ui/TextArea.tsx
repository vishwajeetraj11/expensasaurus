import clsx from "clsx";
import { HTMLProps } from "react";

interface TextAreaProps extends HTMLProps<HTMLTextAreaElement> {
  message?: string;
  error?: boolean;
}

const TextArea = ({ message, error, className, disabled, ...rest }: TextAreaProps) => {
  return (
    <div className="w-full">
      <textarea
        className={clsx(
          "w-full rounded-xl border bg-white/90 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10",
          "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-white/30 dark:focus:ring-white/10",
          error &&
            "border-rose-500 text-rose-600 placeholder:text-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
        rows={3}
        disabled={disabled}
        {...rest}
      />
      {message && <p className="mt-1.5 text-xs text-rose-500">{message}</p>}
    </div>
  );
};

export default TextArea;
