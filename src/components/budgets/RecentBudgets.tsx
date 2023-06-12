import { Badge, Title } from "@tremor/react";
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
      <Title className="mb-6">Available Budgets</Title>
      <div className="flex flex-col gap-4">
        <Table className="mt-5 p-6 shadow-subtle">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="pl-0">Link</TableHeaderCell>
              <TableHeaderCell className="pl-0">Title</TableHeaderCell>
              <TableHeaderCell>Budget</TableHeaderCell>
              <TableHeaderCell>Duration</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.documents?.map((budget, index) => {
              const sadLilDevVariable =
                index === Object.entries(data).length - 1;
              const lastElemClasses = clsx("");
              const firstRowClasses = clsx("pl-0");
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

              return (
                <TableRow key={index}>
                  <TableCell className={clsx(lastElemClasses, firstRowClasses)}>
                    <Link href={`/budgets/${budget.$id}`}>
                      <FiExternalLink />
                    </Link>
                  </TableCell>
                  <TableCell className={clsx(lastElemClasses, firstRowClasses)}>
                    {budget.title}
                  </TableCell>
                  <TableCell>
                    <Text className={clsx(lastElemClasses)}>
                      {formatCurrency(budget.currency, budget.amount)}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text className={clsx(lastElemClasses)}>
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
                    <Badge
                      color={
                        budgetStatus === "Not yet started"
                          ? "yellow"
                          : budgetStatus === "Already ended"
                          ? "red"
                          : "emerald"
                      }
                      icon={
                        budgetStatus === "Active"
                          ? MdTrackChanges
                          : budgetStatus === "Not yet started"
                          ? TbClockCancel
                          : GrInProgress
                      }
                    >
                      {budgetStatus}
                    </Badge>
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
    </>
  );
};

export default RecentBudgets;
