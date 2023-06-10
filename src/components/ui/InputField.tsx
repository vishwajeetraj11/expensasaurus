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
        className={`text-sm text-navy-700 dark:text-white ${isAuth ? "ml-1.5 font-medium" : "ml-3 font-bold"
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
          `mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none ${disabled === true
            ? "!border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:!text-[rgba(255,255,255,0.15)]"
            : isError
              ? "border-red-500 text-red-500 placeholder:text-red-500 dark:!border-red-400 dark:!text-red-400 dark:placeholder:!text-red-400"
              : state === "success"
                ? "border-green-500 text-green-500 placeholder:text-green-500 dark:!border-green-400 dark:!text-green-400 dark:placeholder:!text-green-400"
                : "border-gray-200 dark:!border-white/10 dark:text-white"
          }`
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
