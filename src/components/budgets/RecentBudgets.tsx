import { Title } from "@tremor/react";
import { format } from "date-fns";
import useBudgets from "expensasaures/hooks/useBudgets";
import Link from "next/link";

const RecentBudgets = () => {
  const { data } = useBudgets();

  return (
    <>
      <Title className="mb-6">Recent Budgets</Title>
      <div className="flex flex-col gap-4">
        {data &&
          data?.documents.map((budget) => {
            return (
              <Link key={budget.$id} href={`/budgets/${budget.$id}`}>
                <div className="box-shadow-card w-[500px] px-5 py-4 flex">
                  <div className="flex flex-col flex-1">
                    <div>{budget.title}</div>
                    <div>
                      {format(new Date(budget.startingDate), "dd-MM-yyyy")} to{" "}
                      {format(new Date(budget.endDate), "dd-MM-yyyy")}
                    </div>
                  </div>
                  <div>
                    {budget.currency} {budget.amount}
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </>
  );
};

export default RecentBudgets;
