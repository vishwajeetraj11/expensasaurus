import { Models } from "appwrite";

import ExpenseForm from "expensasaures/components/forms/ExpenseForm";
import Layout from "expensasaures/components/layout/Layout";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

const update = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const router = useRouter();
  const { id } = router.query;

  const { data } = getDoc<Transaction>(
    ["Expenses by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.EXPENSES, id as string],
    { enabled: !!user }
  );

  return (
    <Layout>
      <div className="mx-auto max-w-[800px] mt-10">
        <p>Update Expense</p>
        <ExpenseForm />
      </div>
    </Layout>
  );
};

export default update;
