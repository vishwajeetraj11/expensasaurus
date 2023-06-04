import clsx from "clsx";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { shallow } from "zustand/shallow";
import Navigation from "../Navigation";

interface Props {
  children: React.ReactNode;
  disablePadding?: boolean;
}

const Layout = (props: Props) => {
  const { children, disablePadding } = props;
  const { user, getUser } = useAuthStore(
    (store) => ({ user: store.user, getUser: store.getUser }),
    shallow
  );

  const router = useRouter();

  useEffect(() => {
    (async function () {
      const user = await getUser();
      if (!user) router.push("/login");
    })();
  }, [user]);

  return (
    user ? <div className={clsx("flex flex-col min-h-screen", !disablePadding && 'pb-10')}>
      <Navigation />
      {/* <DarkMode /> */}
      {children}
    </div> : null
  );
};

export default Layout;
