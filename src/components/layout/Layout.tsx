import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { shallow } from "zustand/shallow";
import Navigation from "../Navigation";
import DarkMode from "../ui/DarkMode";

interface Props {
  children: React.ReactNode;
}

const Layout = (props: Props) => {
  const { children } = props;
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
    <>
      <Navigation />
      <DarkMode />
      {children}
    </>
  );
};

export default Layout;
