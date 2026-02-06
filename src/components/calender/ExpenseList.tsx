import { Subtitle, Text } from "@tremor/react";
import { Models, Query } from "appwrite";
import clsx from "clsx";
import { format } from "date-fns";
import emptyDocsAnimation from "expensasaurus/lottie/emptyDocs.json";
import animationData from "expensasaurus/lottie/searchingDocs.json";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { getAllLists } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import { defaultOptions } from "expensasaurus/shared/utils/lottie";
import Lottie from "expensasaurus/components/ui/Lottie";
import { shallow } from "zustand/shallow";
import ExpenseCalCard from "./ExpenseCalCard";

interface Props {
  selectedDay: Date;
  //   data: DocumentListType<Transaction> | undefined;
}

const ExpenseList = (props: Props) => {
  const { selectedDay } = props;
  const { user, userInfo } = useAuthStore((state) => ({ user: state.user, userInfo: state.userInfo }), shallow) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>
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

  const { data, isLoading, isSuccess } = getAllLists<Transaction>(
    ["Expenses", user?.userId, selectedDay],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.EXPENSES,
      [
        Query.equal("userId", user?.userId),
        Query.lessThanEqual("date", endOfDay),
        Query.greaterThan("date", startOfDay),
      ],
    ],
    { enabled: !!user, }
  );

  const emptyState = data?.documents && data?.documents?.length === 0

  const renderContent = () => {
    if (isLoading) {
      return <div className="w-[300px] sm:w-[400px]">
        <Lottie options={defaultOptions(animationData)}
          height={'auto'}
          width={'auto'}
        />
      </div>
    }
    if (isSuccess) {
      if (data?.documents && data?.documents?.length > 0) {
        return <>
          <div className="mt-2 flex flex-col justify-between lg:flex-row">
            <Text className="text-slate-600 dark:text-slate-300">Total Transactions: {data?.total}</Text>
            <Text className="mr-5 text-slate-600 dark:text-slate-300">Total Expense: {formatCurrency(userInfo.prefs.currency, data?.documents.map(v => v.amount).reduce((prev, curr) => curr + prev, 0))}</Text>
          </div>
          <ol className="mt-4 space-y-2 text-sm leading-6">
            {data?.documents?.map((data, index) => (
              <ExpenseCalCard expense={data} key={index} />
            ))}
          </ol>
        </>
      } else {
        return <div className="w-[300px] sm:w-[400px]">
          <Lottie options={defaultOptions(emptyDocsAnimation)}
            height={'auto'}
            width={'auto'}
          />
          <Subtitle className='ml-[-30px] text-center text-slate-700 dark:text-slate-300'>No Expenses Listed</Subtitle>
        </div>
      }
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Expenses for{" "}
        <time dateTime={format(selectedDay, "yyyy-MM-dd")}>
          {format(selectedDay, "MMM dd, yyyy")}
        </time>
      </h2>
      <div className={clsx((isLoading || emptyState) && "flex items-center justify-center md:block")}>
        {renderContent()}
      </div>
    </>
  );
};

export default ExpenseList;
