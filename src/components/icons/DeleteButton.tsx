import { TrashIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import React from "react";

interface DeleteButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const DeleteButton = (props: DeleteButtonProps) => {
  const { className, size = 'lg' } = props;
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  const classes = clsx(
    "bg-red-600/10 hover:bg-red-600/20 transition-all duration-200 rounded-full flex items-center justify-center",
    isLarge && "w-8 h-8 min-w-[32px]",
    isSmall && "w-5 h-5 min-w-[20px]",
    className
  );
  const iconClasses = clsx("text-red-600", isLarge ? "w-4 h-4" : "w-3 h-3")
  return (
    <button type="button" {...props} className={classes}>
      <TrashIcon className={iconClasses} />
    </button>
  );
};

export default DeleteButton;
