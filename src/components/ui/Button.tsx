import React, { HTMLProps } from "react";

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  submitting?: boolean;
  type: "button" | "submit" | "reset";
}

const Button = ({
  submitting,
  children,
  type = "button",
  ...rest
}: ButtonProps) => {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
