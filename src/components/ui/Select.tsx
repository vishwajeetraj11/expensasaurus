import { Listbox } from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import React from "react";

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode | (() => React.ReactNode);
};

export const SelectItem = (_props: SelectItemProps) => null;

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  children: React.ReactNode;
};

type Option = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
};

const Select = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled,
  className,
  buttonClassName,
  children,
}: SelectProps) => {
  const options = React.useMemo<Option[]>(
    () =>
      React.Children.toArray(children)
        .filter((child) => React.isValidElement(child))
        .map((child) => {
          const element = child as React.ReactElement<SelectItemProps>;
          const iconNode =
            typeof element.props.icon === "function"
              ? element.props.icon()
              : element.props.icon;
          return {
            value: element.props.value,
            label: element.props.children,
            icon: iconNode,
          };
        }),
    [children]
  );

  const selected = options.find((option) => option.value === value);

  return (
    <Listbox
      value={value ?? ""}
      onChange={(nextValue) => onValueChange?.(String(nextValue))}
      disabled={disabled}
    >
      <div className={clsx("relative", className)}>
        <Listbox.Button
          className={clsx(
            "flex w-full items-center gap-2 rounded-xl border bg-white/90 px-3 py-2.5 text-left text-sm text-slate-900 shadow-sm outline-none transition",
            "focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10",
            "dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/30 dark:focus:ring-white/10",
            disabled && "cursor-not-allowed opacity-60",
            buttonClassName
          )}
        >
          {selected?.icon && (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {selected.icon}
            </span>
          )}
          <span
            className={clsx(
              "flex-1 truncate",
              !selected && "text-slate-400 dark:text-slate-400"
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </Listbox.Button>

        <Listbox.Options
          className={clsx(
            "absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white/95 p-1 text-sm shadow-lg backdrop-blur",
            "focus:outline-none dark:border-white/10 dark:bg-navy-900/95"
          )}
        >
          {options.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ active }) =>
                clsx(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-slate-700 transition dark:text-slate-200",
                  active && "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                )
              }
            >
              {({ selected: isSelected }) => (
                <>
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {option.icon}
                  </span>
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <CheckIcon className="h-4 w-4 text-slate-500" />
                  )}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default Select;
