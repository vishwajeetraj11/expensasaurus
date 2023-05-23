import { Models } from "appwrite";
import Layout from "expensasaures/components/layout/Layout";
import { getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

const id = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const router = useRouter();
  const { id } = router.query;

  const { data } = getDoc<Transaction>(
    ["Expenses by ID", id, user?.userId],
    ["6467f9811c14ca905ed5", "6467f98b8e8fe5ffa576", id as string],
    { enabled: !!user }
  );

  return <Layout>{JSON.stringify(data)}</Layout>;
};

export default id;
