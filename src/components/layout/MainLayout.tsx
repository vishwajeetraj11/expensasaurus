import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { shallow } from "zustand/shallow";

interface Props {
  children: React.ReactNode;
}

const MainLayout = (props: Props) => {
  const { children } = props;
  const { user, getUser } = useAuthStore(
    (store) => ({ user: store.user, getUser: store.getUser }),
    shallow
  );

  const router = useRouter();

  useEffect(() => {
    (async function () {
      let pushToRoute = "";
      if (!user) {
        const userAfterFetch = await getUser();
        if (!userAfterFetch) {
          pushToRoute =
            router.route === "/signup" ||
            router.route === "/login" ||
            router.route === "/"
              ? router.route
              : "/login";
        }
      } else {
        pushToRoute = "/dashboard";
      }

      router.push(pushToRoute);
    })();
  }, [user]);

  return <>{children}</>;
};

export default MainLayout;
