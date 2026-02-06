import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import {
  AUTHENTICATED_ROUTES,
  PUBLIC_ROUTES,
  ROUTES,
} from "expensasaurus/shared/constants/routes";
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
  const { isReady, query, route, replace } = router;

  useEffect(() => {
    if (!isReady) return;

    let isCancelled = false;

    (async function () {
      try {
        let pushToRoute = "";
        if (!user) {
          const userAfterFetch = await getUser();
          if (isCancelled) return;

          if (!userAfterFetch && !PUBLIC_ROUTES.includes(route)) {
            pushToRoute = ROUTES.LOGIN;
          }
        } else {
          if (!AUTHENTICATED_ROUTES.includes(route)) {
            pushToRoute = ROUTES.DASHBOARD;
          }
        }

        if (
          pushToRoute &&
          pushToRoute !== route &&
          !isCancelled
        ) {
          replace({
            pathname: pushToRoute,
            query,
          });
        }
      } catch (e) {}
    })();

    return () => {
      isCancelled = true;
    };
  }, [user, getUser, isReady, query, replace, route]);

  return <>{children}</>;
};

export default MainLayout;
