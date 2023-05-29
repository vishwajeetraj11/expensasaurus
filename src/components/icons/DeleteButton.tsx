import { TrashIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import React from "react";

interface DeleteButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

const DeleteButton = (props: DeleteButtonProps) => {
  const { className } = props;
  const classes = clsx(
    "w-8 h-8 bg-red-600/10 hover:bg-red-600/20 transition-all duration-200 rounded-full flex items-center justify-center",
    className
  );
  return (
    <button type="button" className={classes} {...props}>
      <TrashIcon className="text-red-600 w-4 h-4" />
    </button>
  );
};

export default DeleteButton;
