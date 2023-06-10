import clsx from 'clsx';
import React from 'react';

interface ErrorMessageProps extends React.HTMLProps<HTMLParagraphElement> {
    children: string;
}

const ErrorMessage = (props: ErrorMessageProps) => {
    const { children, className, ...rest } = props;
    const classes = clsx("text-red-600 dark:text-red-400 text-xs mt-1.5 tracking-normal", className)
    return (
        <p className={classes} {...rest}>
            {children}
        </p>
    );
};

export default ErrorMessage;