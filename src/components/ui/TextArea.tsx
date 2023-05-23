import clsx from "clsx";
import React, { HTMLProps } from "react";

interface TextAreaProps extends HTMLProps<HTMLTextAreaElement> {
  message?: string;
  error?: boolean;
}

const TextArea = (props: TextAreaProps) => {
  const { message, error, ...rest } = props;
  const defaultClasses = clsx(
    "block w-full focus:outline-none rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
  );

  return (
    <div>
      <textarea
        className={defaultClasses}
        rows={3}
        {...rest}
        // message={meta.touched && meta.error}
        // state={meta.error && meta.touched ? "error" : "idle"}
      />
      {message && (
        <span className={clsx(error ? "text-red-600" : "text-stone-700")}>
          {message}
        </span>
      )}
    </div>
  );
};

export default TextArea;
