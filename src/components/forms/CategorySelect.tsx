import clsx from "clsx";
import { categories } from "expensasaures/shared/constants/categories";

interface Props {
  category: (typeof categories)[number];
}

const CategoryIcon = (props: Props) => {
  const { category } = props;

  return (
    <div
      className={clsx(
        "w-6 h-6 mr-2 bg-opacity-25 flex items-center justify-center rounded-full",
        category.className
      )}
    >
      <category.Icon className="w-4 h-4" />
    </div>
  );
};
export default CategoryIcon;
