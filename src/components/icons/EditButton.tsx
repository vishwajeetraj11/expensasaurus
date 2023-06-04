import { PencilIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import React from "react";

interface EditButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

const EditButton = (props: EditButtonProps) => {
  const { className, size = 'lg' } = props;
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const classes = clsx(
    "bg-blue-600/10 hover:bg-blue-600/20 transition-all duration-200 rounded-full flex items-center justify-center",
    isLarge && "w-8 h-8",
    isSmall && "w-5 h-5",
    className
  );
  const iconClasses = clsx("text-blue-600", isLarge ? "w-4 h-4" : "w-3 h-3")

  return (
    <button type="button" className={classes} {...props}>
      <PencilIcon className={iconClasses} />
    </button>
  );
};

export default EditButton;
