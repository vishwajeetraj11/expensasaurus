import clsx from "clsx";
import React, { HTMLProps } from "react";

interface LabelProps extends HTMLProps<HTMLLabelElement> {
  children: React.ReactNode;
}

const FormInputLabel = (props: LabelProps) => {
  const { children, className } = props;
  const defaultClasses = clsx(className, 'dark:text-slate-200 mb-2 block text-[14px]')
  return <label {...props} className={defaultClasses}>{children}</label>;
};

export default FormInputLabel;
