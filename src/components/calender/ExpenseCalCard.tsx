import clsx from "clsx";
import { format, formatDistance } from "date-fns";
import { categories } from "expensasaurus/shared/constants/categories";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { database } from "expensasaurus/shared/services/appwrite";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import Link from "next/link";
import { toast } from "sonner";
interface Props {
  expense: Transaction;
}

function ExpenseCalCard(props: Props) {
  const { expense } = props;
  let createdDate = new Date(expense.date);
  const now = new Date();
  const formattedDate =
    createdDate.getTime() > now.getTime()
      ? format(createdDate, `d MMMM yy`)
      : formatDistance(createdDate, now);
  const categoryInfo = categories.find(
    (category) => category.key === expense.category
  );
  const SelectedIcon = categoryInfo?.Icon;

  const onDelete = async (expenseId: string) => {
    try {
      const data = await database.deleteDocument(
        ENVS.DB_ID,
        ENVS.COLLECTIONS.EXPENSES,
        expenseId
      );
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Expense deletion failed.");
    }
  };

  return (
    <Link href={`/expenses/${expense.$id}`}>
      <li className="flex px-4 py-2 items-center rounded-xl transition-all duration-300 dark:hover:bg-slate-600/20 hover:bg-slate-100/80 relative">
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

          <div className="w-[80%]">
            <p className="text-stone-700 dark:text-stone-50/60 font-semibold text-md">
              {expense.title}
            </p>
            <p className="text-stone-600 dark:text-stone-100/50 text-xs font-medium line-clamp-1">
              {expense.description}
            </p>
          </div>
          <div className="ml-auto self-center flex flex-col">
            <p className="text-md text-slate-500 dark:text-white font-semibold text-right">
              {formatCurrency(expense.currency, expense.amount)}
            </p>
          </div>
        </div>
      </li>
    </Link>
  );
}

export default ExpenseCalCard;
