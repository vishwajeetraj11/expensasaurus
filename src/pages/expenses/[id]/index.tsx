import { Button, Metric, Text } from "@tremor/react";
import { Models } from "appwrite";
import clsx from "clsx";
import { format } from "date-fns";
import Attachments from "expensasaurus/components/expense/Attachments";
import Tag from "expensasaurus/components/expense/Tag";
import DeleteButton from "expensasaurus/components/icons/DeleteButton";
import EditButton from "expensasaurus/components/icons/EditButton";

import Layout from "expensasaurus/components/layout/Layout";
import EmptyTwoDocs from "expensasaurus/components/lottie/emptyTwoDocs";
import NotFound from "expensasaurus/components/lottie/notFound";
import Searching from "expensasaurus/components/lottie/searching";
import DeleteModal from "expensasaurus/components/modal/DeleteModal";
import CategoryBadge from "expensasaurus/components/ui/CategoryBadge";
import { categories } from "expensasaurus/shared/constants/categories";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { ROUTES, routeBuilders } from "expensasaurus/shared/constants/routes";
import { storage } from "expensasaurus/shared/services/appwrite";
import {
  deleteDoc,
  getAllLists,
  getDoc,
} from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { capitalize } from "expensasaurus/shared/utils/common";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import { getQueryForExpenses } from "expensasaurus/shared/utils/react-query";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQueries, useQueryClient } from "react-query";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";

const id = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();
  const { data, error, isLoading, isSuccess } = getDoc<Transaction>(
    ["Expenses by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.EXPENSES, id as string],
    { enabled: !!user }
  );

  const { mutate, reset } = deleteDoc(
    ["Delete Expenses by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.EXPENSES, id as string],
    {}
  );

  const { data: moreExpensesInCategory } = getAllLists<Transaction>(
    ["Expenses", user?.userId, data?.category],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.EXPENSES,
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



  const categoryInfo = categories.find((cat) => cat.key === data?.category);
  const SelectedIcon = categoryInfo?.Icon;

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const attachments = data?.attachments || [];

  const fileDelete = useQueries(attachments.map((id: string) => ({
    queryKey: ['file-delete', id, user.userId],
    queryFn: async () => {
      return storage.deleteFile(ENVS.BUCKET_ID, id);
    },
    enabled: false
  })));

  const moreExpensesInCategoryRender = moreExpensesInCategory?.documents
    ?.filter((doc) => doc.$id !== id)

  if (error && error.code === 404) {
    return <Layout>
      <NotFound
        title="Expense Not Found"
        subtitle="Oops! We couldn't find any matching expenses."
        description="Expenses can sometimes slip away, leaving us with gaps in our financial journey. Take this as an opportunity to review your spending habits, reassess your financial goals, and make informed decisions moving forward. Remember, every expense tells a story, and with careful tracking and planning, you can regain control over your finances. Stay vigilant, keep a keen eye on your expenses, and let's continue building a strong financial foundation together!" />
    </Layout>
  }

  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Details of an Expense Transaction</title>
      </Head>
      <div className="mx-auto max-w-[1200px] pt-10 block w-full">
        {isLoading ? <Searching
          title="Searching for expense..."
          // subtitle="Please wait while we retrieve the expense details..."
          subtitle="Meanwhile, here's a tip for you."
          description="Track your expenses, gain financial control, and plan for a better future. Remember, every small step towards managing your expenses leads to a big difference in your financial well-being."
        />
          : isSuccess && data
            ? <div className="flex items-start flex-col md:flex-row w-full gap-10 px-4">
              <div className="flex flex-col flex-1 w-[inherit]">
                <div className="flex">
                {categoryInfo && (
                  <CategoryBadge
                    Icon={SelectedIcon}
                    colorClassName={categoryInfo.className}
                    size="lg"
                    className="mr-3"
                  />
                )}

                  <div>
                    {data?.category && (
                      <Text className="mt-3">{capitalize(data?.category)}</Text>
                    )}
                    <Metric>{data?.title}</Metric>
                  {data?.tag ? <Tag text={data.tag}></Tag> : ''}
                  </div>
                  <div className="flex gap-3 ml-auto">
                    <Link href={routeBuilders.expenseEdit(String(id))} shallow>
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

                  {data?.attachments?.length ? <> <Text className="text-slate-700 p-3 bg-slate-50 mt-2">
                    {data?.description}
                  </Text><Attachments ids={data?.attachments} /></> : null}
                </div>
              </div>
              <div className="md:w-[40%] w-full">
                <div className="flex items-center justify-between mb-3">
                  <Text>More expenses in this category</Text>
                  <Link href={ROUTES.EXPENSE_CREATE}>
                    <Button>+ Add Expense</Button>
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {moreExpensesInCategoryRender?.length === 0
                    ? <EmptyTwoDocs subtitle="No More Expenses in this category" />
                    : moreExpensesInCategoryRender?.map((doc) => {
                      const categoryInfo = categories.find(
                        (cat) => cat.key === doc?.category
                      );
                      const SelectedIcon = categoryInfo?.Icon;
                      return (
                        <Link
                          className="box-shadow-card px-4 py-3 rounded-sm"
                          key={doc.$id}
                          href={routeBuilders.expenseDetail(doc.$id)}
                        >
                          <div className="flex items-center mt-2">
                            {categoryInfo && (
                              <CategoryBadge
                                Icon={SelectedIcon}
                                colorClassName={categoryInfo.className}
                                size="sm"
                                className="mr-3"
                              />
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
          try {
            if (fileDelete.length !== 0) {
              toast('deleting expense...');
            }
            fileDelete.forEach((query) => {
              setTimeout(() => {
                query.refetch({ throwOnError: true }).catch((err) => {
                  toast.error("Expense deletion failed, please try again sometime later.");
                });
              }, 1000);
            });

            mutate(
              {},
              {
                onSettled: () => {
                  reset();
                },
                onSuccess: () => {
                  toast.success("Expense deleted successfully");
                  router.push(ROUTES.EXPENSES);
                },
                onError: () => {
                  toast.error("Expense deletion failed");
                },
              }
            );
          } catch (e) {

          }
        }}
        resource="expense"
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
        }}
      />
    </Layout>
  );
};

export default id;
