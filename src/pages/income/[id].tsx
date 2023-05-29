import { Models } from "appwrite";
import Layout from "expensasaures/components/layout/Layout";
import { ENVS } from "expensasaures/shared/constants/constants";
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
    ["Income by ID", id, user?.userId],
    [ENVS.DB_ID, "646879f739377942444c", id as string],
    { enabled: !!user }
  );

  return <Layout>{JSON.stringify(data)}</Layout>;
};

export default id;
