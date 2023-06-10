import { Metric, Text } from "@tremor/react";
import { Models } from "appwrite";
import clsx from "clsx";
import { format } from "date-fns";
import Attachments from "expensasaures/components/expense/Attachments";
import Tag from "expensasaures/components/expense/Tag";
import DeleteButton from "expensasaures/components/icons/DeleteButton";
import EditButton from "expensasaures/components/icons/EditButton";

import Layout from "expensasaures/components/layout/Layout";
import EmptyTwoDocs from "expensasaures/components/lottie/emptyTwoDocs";
import NotFound from "expensasaures/components/lottie/notFound";
import Searching from "expensasaures/components/lottie/searching";
import DeleteModal from "expensasaures/components/modal/DeleteModal";
import { categories, incomeCategories } from "expensasaures/shared/constants/categories";
import { ENVS } from "expensasaures/shared/constants/constants";
import {
  deleteDoc,
  getAllLists,
  getDoc
} from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { capitalize } from "expensasaures/shared/utils/common";
import { formatCurrency } from "expensasaures/shared/utils/currency";
import { getQueryForExpenses } from "expensasaures/shared/utils/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";

const id = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };

  const router = useRouter();
  const { id } = router.query;
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const { data, isLoading, isSuccess, error } = getDoc<Transaction>(
    ["Income by ID", id, user?.userId],
    [ENVS.DB_ID, "646879f739377942444c", id as string],
    { enabled: !!user }
  );
  const categoryInfo = incomeCategories.find((cat) => cat.key === data?.category);
  const SelectedIcon = categoryInfo?.Icon;


  const { data: moreIncomesInCategory } = getAllLists<Transaction>(
    ["Incomes", user?.userId, data?.category],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.INCOMES,
      getQueryForExpenses({
        dates: {},
        limit: 3,
        orderByDesc: "date",
        user,
        category: data?.category || "others",
      }),
    ],
    { enabled: !!user && !!data }
  );

  const { mutate, reset } = deleteDoc(
    ["Delete Incomes by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.INCOMES, id as string],
    {}
  );

  const moreIncomesInCategoryRender = moreIncomesInCategory?.documents
    ?.filter((doc) => doc.$id !== id)

  if (error && error.code === 404) {
    return <Layout>
      <NotFound
        title="Income Not Found"
        subtitle="Missing Income"
        description="It appears that the income you're searching for has gone missing on the financial horizon. Financial journeys are full of surprises, and sometimes certain income sources may fade away or transform into new opportunities. Take a moment to reevaluate your income streams, explore new avenues, or adjust your financial plans accordingly. Remember, there are always new opportunities waiting to be discovered. Stay resilient, adapt to change, and let's continue the pursuit of financial stability and growth!" />
    </Layout>
  }

  return <Layout>
    <div className="mx-auto max-w-[1200px] pt-10 block w-full">
      {isLoading ? <Searching
        title="Searching for income..."
        // subtitle="Please wait while we retrieve the income details."
        subtitle="Meanwhile, here's a tip for you."
        description="Track your income, and watch your financial possibilities grow."
      /> : isSuccess ? <div className="flex items-start flex-col md:flex-row w-full gap-10 px-4">
        <div className="flex flex-col flex-1 w-[inherit]">
          <div className="flex">
            {categoryInfo && (
              <div
                className={clsx(
                  "min-w-[80px] h-20 w-20 bg-opacity-25 rounded-full flex items-center justify-center mr-3",
                  categoryInfo.className
                )}
              >
                {SelectedIcon && <SelectedIcon className="w-10 h-10" />}
              </div>
            )}

            <div>
              {data?.category && (
                <Text className="mt-3">{capitalize(data?.category)}</Text>
              )}
              <Metric>{data?.title}</Metric>
              {data?.tag ? <Tag text={data.tag}></Tag> : ''}
            </div>
            <div className="flex gap-3 ml-auto">
              <Link href={`/incomes/${id}/edit`} shallow>
                <EditButton />
              </Link>
              <DeleteButton
                onClick={() => {
                  setIsDeleteOpen(true);
                }}
              />
            </div>
          </div>
          <div className="ml-[92px] ">
            <div className="grid grid-cols-[80px_1fr]">
              <Text>Amount</Text>
              {data?.currency && (
                <Text className="text-slate-700">
                  {formatCurrency(data?.currency, data?.amount || 0)}
                </Text>
              )}
              <Text>Date</Text>

              {data?.date && (
                <Text className="text-slate-700">
                  {format(new Date(data?.date), "dd MMM yyyy")}
                </Text>
              )}
            </div>
            <Text className="text-slate-700 p-3 bg-slate-50 mt-2">
              {data?.description}
            </Text>
            {data?.attachments && <Attachments ids={data?.attachments} />}
          </div>
        </div>
        <div className="md:w-[40%] w-full">
          <Text className="mb-3">More incomes in this category</Text>
          <div className="flex flex-col gap-3">
            {moreIncomesInCategoryRender?.length !== 0 ? <EmptyTwoDocs subtitle="No More Incomes in this category" /> : moreIncomesInCategoryRender?.map((doc) => {
              const categoryInfo = categories.find(
                (cat) => cat.key === doc?.category
              );
              const SelectedIcon = categoryInfo?.Icon;
              return (
                <Link
                  className="box-shadow-card px-4 py-3 rounded-sm"
                  key={doc.$id}
                  href={`/expenses/${doc.$id}`}
                >
                  <div className="flex items-center mt-2">
                    {categoryInfo && (
                      <div
                        className={clsx(
                          "h-8 w-8 min-w-[32px] bg-opacity-25 rounded-full flex items-center justify-center mr-3",
                          categoryInfo.className
                        )}
                      >
                        {SelectedIcon && (
                          <SelectedIcon className="w-4 h-4" />
                        )}
                      </div>
                    )}
                    <Text>{capitalize(doc?.category)}</Text>
                  </div>
                  <div className="ml-[44px]">
                    <Text className="text-slate-500">{doc.title}</Text>
                    <div className="grid grid-cols-[80px_1fr] mt-2">
                      <Text>Amount</Text>
                      {doc?.currency && (
                        <Text className="text-slate-700">
                          {formatCurrency(doc?.currency, doc?.amount || 0)}
                        </Text>
                      )}
                      <Text>Date</Text>

                      <Text className="text-slate-700">
                        {format(new Date(doc?.date), "dd MMM yyyy")}
                      </Text>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div> : null}
    </div>
    <DeleteModal
      action="delete"
      onAction={() => {
        mutate(
          {},
          {
            onSettled: () => {
              reset();
            },
            onSuccess: () => {
              toast.success("Expense deleted successfully");
              router.push("/expenses");
            },
            onError: () => {
              toast.error("Expense deletion failed");
            },
          }
        );

      }}
      resource="expense"
      isOpen={isDeleteOpen}
      onClose={() => {
        setIsDeleteOpen(false);
      }}
    />
  </Layout>;
};

export default id;
