import { Models } from "appwrite";
import BudgetForm from "expensasaures/components/forms/BudgetForm";
import Layout from "expensasaures/components/layout/Layout";

import { ENVS } from "expensasaures/shared/constants/constants";
import { getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Budget } from "expensasaures/shared/types/budget";
import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

const edit = () => {
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
  return (
    <Layout>
      <div className="mx-auto px-4 max-w-[1200px] mt-10 w-full flex flex-1 h-full">
        <div className="w-[50%]">
          <h1 className="text-center mb-10">Update Budget</h1>
          <BudgetForm />
        </div>
        <div className="h-auto w-full lg:rounded-bl-[120px] xl:rounded-bl-[200px] rounded-md flex items-center justify-center flex-1"
          style={{ backgroundImage: `url(/img/create_budget.png)` }}
        >

        </div>
      </div>
    </Layout>
  );
};

export default edit;

