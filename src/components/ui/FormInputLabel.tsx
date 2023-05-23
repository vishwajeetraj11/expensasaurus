import React, { HTMLProps } from "react";

interface LabelProps extends HTMLProps<HTMLLabelElement> {
  children: React.ReactNode;
}

const FormInputLabel = (props: LabelProps) => {
  const { children } = props;
  return <label {...props}>{children}</label>;
};

export default FormInputLabel;
