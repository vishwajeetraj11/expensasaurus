import { Models } from "appwrite";
import { format } from "date-fns";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { deleteDoc } from "expensasaurus/shared/services/query";
import { Budget } from "expensasaurus/shared/types/budget";
import { useRouter } from "next/router";

import { Text } from "@tremor/react";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import Link from "next/link";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";

interface BudgetCardProps extends Budget { }

const BudgetCard = (props: BudgetCardProps) => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };

  const { $id, title, startingDate, endDate, currency, amount } = props;

  const router = useRouter();
  //   const { id } = router.query;

  const { mutate, reset } = deleteDoc(
    ["Delete Budgets by ID", $id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.BUDGETS, $id as string],
    {}
  );

  const onDelete = () => {
    mutate(
      {},
      {
        onSettled: () => {
          reset();
        },
        onSuccess: () => {
          toast.success("Buget deleted successfully");
          router.push("/budgets");
        },
        onError: (er) => {
          console.log(er);
          toast.error("Buget deletion failed");
        },
      }
    );
  };

  return (
    <Link href={`/budgets/${$id}`}>
      <div className="box-shadow-card w-[500px] px-5 py-4 flex">
        <div className="flex flex-col flex-1">
          <div>{title}</div>
          <div>
            {format(new Date(startingDate), "dd-MM-yyyy")} to{" "}
            {format(new Date(endDate), "dd-MM-yyyy")}
          </div>
        </div>
        <div>
          <Text>
            {currency} {amount}
          </Text>
          {/* <DeleteButton className="ml-auto" onClick={onDelete} /> */}
        </div>
      </div>
    </Link>
  );
};

export default BudgetCard;
