import clsx from "clsx";
import React from "react";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, { wrapper: string; icon: string }> = {
  sm: { wrapper: "h-8 w-8 min-w-[32px]", icon: "h-4 w-4" },
  md: { wrapper: "h-10 w-10 min-w-[40px]", icon: "h-5 w-5" },
  lg: { wrapper: "h-20 w-20 min-w-[80px]", icon: "h-10 w-10" },
};

type Props = {
  colorClassName?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: Size;
  className?: string;
};

const CategoryBadge = ({
  colorClassName,
  Icon,
  size = "md",
  className,
}: Props) => {
  const classes = sizeClasses[size] ?? sizeClasses.md;

  return (
    <div
      className={clsx(
        "rounded-full bg-opacity-60 flex items-center justify-center",
        classes.wrapper,
        colorClassName,
        className
      )}
    >
      {Icon ? <Icon className={classes.icon} /> : null}
    </div>
  );
};

export default CategoryBadge;
