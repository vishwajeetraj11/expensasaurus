import clsx from "clsx";
import { HTMLProps } from "react";

interface TextAreaProps extends HTMLProps<HTMLTextAreaElement> {
  message?: string;
  error?: boolean;
}

const TextArea = (props: TextAreaProps) => {
  const { message, error, ...rest } = props;
  const defaultClasses = clsx(
    'tremor-TextInput-input w-full focus:outline-none focus:ring-0 border-none bg-transparent text-tremor-default text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis pl-4 pr-4 py-2 placeholder:text-tremor-content dark:placeholder:text-dark-tremor-content'
  );

  return (
    <div className={clsx(
      'tremor-TextInput-root relative w-full flex items-center min-w-[10rem] outline-none rounded-tremor-default shadow-tremor-input dark:shadow-dark-tremor-input bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border border'
    )}>
      <textarea
        className={defaultClasses}
        rows={3}
        {...rest}
      />
      {message && (
        <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 tracking-normal">
          {message}
        </p>
      )}
    </div>
  );
};

export default TextArea;
