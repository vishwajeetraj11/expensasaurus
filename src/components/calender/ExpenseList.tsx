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
import Lottie from "react-lottie";
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
          <div className="flex flex-col lg:flex-row justify-between mt-2">
            <Text>  Total Transactions : {data?.total}</Text>
            <Text className="mr-5"> Total Expense: {formatCurrency(userInfo.prefs.currency, data?.documents.map(v => v.amount).reduce((prev, curr) => curr + prev, 0))}</Text>
          </div>
          <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
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
          <Subtitle className='text-slate-700 dark:text-slate-400 text-center ml-[-30px]'>No Expenses Listed</Subtitle>
        </div>
      }
    }
  }

  return (
    <>
      <h2 className="font-semibold dark:text-stone-300 text-gray-900">
        Expenses for{" "}
        <time dateTime={format(selectedDay, "yyyy-MM-dd")}>
          {format(selectedDay, "MMM dd, yyy")}
        </time>
      </h2>
      <div className={clsx((isLoading || emptyState) && "flex items-center justify-center md:block")}>
        {renderContent()}
      </div>
    </>
  );
};

export default ExpenseList;
