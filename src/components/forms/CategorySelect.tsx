import { categories, incomeCategories } from "expensasaurus/shared/constants/categories";
import CategoryBadge from "expensasaurus/components/ui/CategoryBadge";

interface Props {
  category: (typeof categories)[number] | (typeof incomeCategories)[number];
}

const CategoryIcon = (props: Props) => {
  const { category } = props;

  return (
    <CategoryBadge
      Icon={category.Icon}
      colorClassName={category.className}
      size="sm"
      className="mr-2 h-6 w-6 min-w-[24px]"
    />
  );
};
export default CategoryIcon;
