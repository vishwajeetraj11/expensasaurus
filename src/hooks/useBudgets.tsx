import { Models, Query } from "appwrite";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Budget } from "expensasaures/shared/types/budget";
import { useState } from "react";
import { shallow } from "zustand/shallow";

const useBudgets = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = getAllLists<Budget>(
    ["Budgets", user?.userId],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.BUDGETS,
      [
        Query.equal("userId", user?.userId),
        Query.limit(limit),
        Query.orderDesc("endDate"),
      ],
    ],
    { enabled: !!user, staleTime: Infinity }
  );

  return { data, setLimit };
};

export default useBudgets;
