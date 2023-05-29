import { Metric, Title } from "@tremor/react";
import { Models, Query } from "appwrite";
import ExpenseByCategory from "expensasaures/components/category/ExpenseByCategory";
import Layout from "expensasaures/components/layout/Layout";
import { categories } from "expensasaures/shared/constants/categories";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getAllLists, getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Budget } from "expensasaures/shared/types/budget";
import { Transaction } from "expensasaures/shared/types/transaction";
import { calculateTotalExpensesByCategory } from "expensasaures/shared/utils/calculation";
import { capitalize } from "expensasaures/shared/utils/common";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { shallow } from "zustand/shallow";

const id = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const router = useRouter();
  const { id } = router.query;

  const { data } = getDoc<Budget>(
    ["Budget by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.BUDGETS, id as string],
    { enabled: !!user }
  );

  const { data: budgetDurationExpenses } = getAllLists<Transaction>(
    ["Expenses", data?.startingDate, data?.endDate],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.EXPENSES,
      [Query.equal("userId", user?.userId)],
    ],
    {
      enabled: !!data,
    }
  );

  const budgetByCategory: { [key: string]: number } = {
    business: data?.business || 0,
    entertainment: data?.entertainment || 0,
    food: data?.food || 0,
    healthcare: data?.healthcare || 0,
    education: data?.education || 0,
    travel: data?.travel || 0,
    other: data?.other || 0,
    savings: data?.savings || 0,
    housing: data?.housing || 0,
    insurance: data?.insurance || 0,
    utilities: data?.utilities || 0,
    investments: data?.investments || 0,
    personalcare: data?.personalcare || 0,
    transportation: data?.transportation || 0,
  };

  const expensesByCategory = calculateTotalExpensesByCategory(
    budgetDurationExpenses?.documents || []
  );

  const match = () => {
    const res: any = {};
    const njk = Object.fromEntries(
      Object.entries(budgetByCategory).map(([key, val]) => {
        return [key, { budget: val, ...expensesByCategory[key] }];
      })
    );
    return njk;
  };

  return (
    <Layout>
      <div className="mx-auto max-w-[1200px] pt-10">
        <Metric className="text-slate-600 mb-4">Spending Limit</Metric>
        <Title>{data?.title}</Title>
        {Object.entries(match()).map(([category, value], i) => {
          const categoryInfo = categories.find(
            (c) => c.category === capitalize(category)
          );
          const SelectedIcon = categoryInfo?.Icon;
          if (!categoryInfo) return <Fragment key={i}></Fragment>;
          return (
            <ExpenseByCategory
              key={i}
              category={category}
              categoryInfo={categoryInfo}
              SelectedIcon={SelectedIcon}
              value={{
                amount: value.amount,
                transactionsCount: value.transactionsCount,
                budget: value.budget,
              }}
              i={i}
            />
          );
        })}
      </div>
    </Layout>
  );
};

export default id;
