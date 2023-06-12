import { Models, Query } from "appwrite";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { getAllLists } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Budget } from "expensasaurus/shared/types/budget";
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

  return { data, setLimit, isLoading };
};

export default useBudgets;
