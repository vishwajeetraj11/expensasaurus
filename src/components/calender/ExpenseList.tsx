import { Models, Query } from "appwrite";
import { format, isSameDay, isTomorrow } from "date-fns";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { shallow } from "zustand/shallow";
import ExpenseCalCard from "./ExpenseCalCard";

interface Props {
  selectedDay: Date;
  //   data: DocumentListType<Transaction> | undefined;
}

const ExpenseList = (props: Props) => {
  const { selectedDay } = props;
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };

  const startOfDay = new Date(
    selectedDay.getFullYear(),
    selectedDay.getMonth(),
    selectedDay.getDate()
  ).toISOString();

  const endOfDay = new Date(
    selectedDay.getFullYear(),
    selectedDay.getMonth(),
    selectedDay.getDate() + 1
  ).toISOString();

  const { data, isLoading } = getAllLists<Transaction>(
    ["Expenses", user?.userId, selectedDay],
    [
      ENVS.DB_ID,
      "6467f98b8e8fe5ffa576",
      [
        Query.equal("userId", user?.userId),
        Query.lessThanEqual("date", endOfDay),
        Query.greaterThan("date", startOfDay),
      ],
    ],
    { enabled: !!user, staleTime: Infinity }
  );

  return (
    <>
      <h2 className="font-semibold text-gray-900">
        Expenses for{" "}
        <time dateTime={format(selectedDay, "yyyy-MM-dd")}>
          {format(selectedDay, "MMM dd, yyy")}
        </time>
      </h2>
      <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
        {isLoading ? (
          <>loading...</>
        ) : data?.documents && data?.documents?.length > 0 ? (
          data?.documents?.map((data, index) => (
            <ExpenseCalCard expense={data} key={index} />
          ))
        ) : (
          <p>
            No expenses listed for{" "}
            {isSameDay(selectedDay, new Date())
              ? "today"
              : isTomorrow(selectedDay)
              ? "tomorrow"
              : format(selectedDay, "MMM dd, yyy")}
            .
          </p>
        )}
      </ol>
    </>
  );
};

export default ExpenseList;
