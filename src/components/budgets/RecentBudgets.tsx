import { Title } from "@tremor/react";
import useBudgets from "expensasaurus/hooks/useBudgets";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@tremor/react";
import { Models } from "appwrite";
import clsx from "clsx";
import { format } from "date-fns";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { deleteDoc } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { GrInProgress } from "react-icons/gr";
import { MdTrackChanges } from "react-icons/md";
import { TbClockCancel } from "react-icons/tb";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import DeleteButton from "../icons/DeleteButton";
import EditButton from "../icons/EditButton";
import DeleteModal from "../modal/DeleteModal";

const RecentBudgets = () => {
  const { data } = useBudgets();
  const router = useRouter();
  const [deleteBudgetId, setDeleteBudgetId] = useState("");
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const { mutate, reset } = deleteDoc(
    ["Delete Budget by ID", deleteBudgetId, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.BUDGETS, deleteBudgetId],
    {}
  );
  const queryClient = useQueryClient();
  return (
    <>
      <Title className="mb-6 text-slate-900 dark:text-slate-100">
        Available Budgets
      </Title>
      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)]">
          <Table className="w-full text-sm">
            <TableHead className="bg-white dark:bg-slate-900/80">
              <TableRow className="border-b border-slate-200 dark:border-white/10">
                <TableHeaderCell className="pl-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Link
                </TableHeaderCell>
                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Title
                </TableHeaderCell>
                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Budget
                </TableHeaderCell>
                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Duration
                </TableHeaderCell>
                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Actions
                </TableHeaderCell>
                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Status
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-200/70 dark:divide-white/10">
            {data?.documents?.map((budget, index) => {
              const firstRowClasses = clsx("pl-6");
              const currentDate = new Date(); // Get the current date
              const budgetStartDate = new Date(budget.startingDate); // Budget start date
              const budgetEndDate = new Date(budget.endDate); // Budget end date

              const isWithinBudgetDates =
                currentDate > budgetStartDate && currentDate < budgetEndDate;

              const budgetStatus = isWithinBudgetDates
                ? "Active"
                : currentDate < budgetStartDate
                ? "Not yet started"
                : "Already ended";

              const statusStyles =
                budgetStatus === "Active"
                  ? {
                      wrapper:
                        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30",
                      Icon: MdTrackChanges,
                    }
                  : budgetStatus === "Not yet started"
                  ? {
                      wrapper:
                        "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30",
                      Icon: GrInProgress,
                    }
                  : {
                      wrapper:
                        "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30",
                      Icon: TbClockCancel,
                    };

              return (
                <TableRow key={index} className="transition hover:bg-slate-50/60 dark:hover:bg-white/5">
                  <TableCell className={firstRowClasses}>
                    <Link href={`/budgets/${budget.$id}`}>
                      <FiExternalLink className="h-4 w-4 text-slate-400 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100" />
                    </Link>
                  </TableCell>
                  <TableCell className={firstRowClasses}>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {budget.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Text className="text-slate-600 dark:text-slate-300">
                      {formatCurrency(budget.currency, budget.amount)}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-slate-600 dark:text-slate-300">
                      {format(new Date(budget.startingDate), "dd MMMM yyyy")} to{" "}
                      {format(new Date(budget.endDate), "dd MMMM yyyy")}
                    </Text>
                  </TableCell>
                  <TableCell className="flex gap-4">
                    <Link href={`budgets/${budget.$id}/edit`}>
                      <EditButton />
                    </Link>
                    <DeleteButton
                      onClick={() => {
                        setDeleteBudgetId(budget.$id);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                        statusStyles.wrapper
                      )}
                    >
                      <statusStyles.Icon className="h-3.5 w-3.5" />
                      {budgetStatus}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}

            <DeleteModal
              action="delete"
              isOpen={Boolean(deleteBudgetId)}
              onAction={() => {
                mutate(
                  {},
                  {
                    onSettled: () => {
                      reset();
                      setDeleteBudgetId("");
                    },
                    onSuccess: () => {
                      queryClient.invalidateQueries({
                        queryKey: ["Budgets", user?.userId],
                      });
                      setDeleteBudgetId("");
                      toast.success("Budget deleted successfully");
                    },
                    onError: () => {
                      toast.error("Budget deletion failed");
                      setDeleteBudgetId("");
                    },
                  }
                );
              }}
              onClose={() => {
                setDeleteBudgetId("");
              }}
              resource="budget"
            />
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default RecentBudgets;
