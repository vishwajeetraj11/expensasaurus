import clsx from "clsx";
import { HTMLProps } from "react";
import ErrorMessage from "./ErrorMessage";

interface InputFieldProps extends HTMLProps<HTMLInputElement> {
  label: string;
  extra?: string;
  variant?: "auth" | "bold";
  state?: "error" | "success" | "idle";
  message?: string;
}

function InputField(props: InputFieldProps) {
  const {
    label,
    id,
    extra,
    type,
    placeholder,
    variant,
    state = "idle",
    disabled,
    message,
    ...rest
  } = props;

  const isAuth = variant === "auth";
  const isError = state === "error";

  return (
    <div className={`${extra}`}>
      <label
        htmlFor={id}
        className={`text-sm text-slate-700 dark:text-slate-200 ${
          isAuth ? "ml-1.5 font-medium" : "ml-3 font-semibold"
        }`}
      >
        {label}
      </label>
      <input
        disabled={disabled}
        type={type}
        id={id}
        placeholder={placeholder}
        className={clsx(
          "mt-2 flex h-12 w-full items-center rounded-xl border bg-white/90 px-3 text-sm text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10",
          "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-white/30 dark:focus:ring-white/10",
          disabled
            ? "cursor-not-allowed opacity-60"
            : isError
            ? "border-rose-500 text-rose-600 placeholder:text-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : state === "success"
            ? "border-emerald-500 text-emerald-600 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
            : "border-slate-200"
        )}
        {...rest}
      />
      {message && (
        <ErrorMessage>
          {message}
        </ErrorMessage>
      )}
    </div>
  );
}

export default InputField;
