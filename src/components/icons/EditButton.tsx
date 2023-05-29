import { PencilIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import React from "react";

interface EditButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

const EditButton = (props: EditButtonProps) => {
  const { className } = props;
  const classes = clsx(
    "w-8 h-8 bg-blue-600/10 hover:bg-blue-600/20 transition-all duration-200 rounded-full flex items-center justify-center",
    className
  );
  return (
    <button type="button" className={classes} {...props}>
      <PencilIcon className="text-blue-600 w-4 h-4" />
    </button>
  );
};

export default EditButton;
