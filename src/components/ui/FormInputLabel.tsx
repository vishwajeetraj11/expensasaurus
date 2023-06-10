import clsx from "clsx";
import React, { HTMLProps } from "react";

interface LabelProps extends HTMLProps<HTMLLabelElement> {
  children: React.ReactNode;
}

const FormInputLabel = (props: LabelProps) => {
  const { children, className } = props;
  const defaultClasses = clsx(className, 'mb-2 block text-[14px]')
  return <label {...props} className={defaultClasses}>{children}</label>;
};

export default FormInputLabel;
