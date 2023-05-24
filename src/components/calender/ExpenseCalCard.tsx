import clsx from "clsx";
import { formatDistance } from "date-fns";
import { categories } from "expensasaures/shared/constants/categories";
import { Transaction } from "expensasaures/shared/types/transaction";
import { timeSince } from "expensasaures/shared/utils/dates";

interface Props {
  expense: Transaction;
}

function ExpenseCalCard(props: Props) {
  const { expense } = props;
  let createdDate = new Date(expense.date);
  const now = new Date();
  const formattedDate = formatDistance(createdDate, now);
  const categoryInfo = categories.find(
    (category) => category.key === expense.category
  );
  const SelectedIcon = categoryInfo?.Icon;
  return (
    <li className="flex px-4 py-2 items-center rounded-xl transition-all duration-300 hover:bg-slate-100/80 relative">
      <div className="py-2 flex flex-1">
        {SelectedIcon && (
          <div
            className={clsx(
              "min-w-[40px] h-10 bg-opacity-25 rounded-full flex items-center justify-center mr-3",
              categoryInfo.className
            )}
          >
            <SelectedIcon className="w-5 h-5" />
          </div>
        )}

        <div className="w-[65%]">
          <p className="text-stone-700 font-semibold text-md">
            {expense.title}
          </p>
          <p className="text-stone-600 text-xs font-medium line-clamp-1">
            {expense.description}
          </p>
        </div>
        <p className="text-xs ml-auto text-slate-500 text-right">
          {timeSince(createdDate) || formattedDate}
        </p>
      </div>
    </li>
  );
}

export default ExpenseCalCard;
