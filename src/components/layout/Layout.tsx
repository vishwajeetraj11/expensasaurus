import clsx from "clsx";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { useRouter } from "next/router";
import React from "react";
import { shallow } from "zustand/shallow";
import CurrencyModal from "../CurrencyModal";
import Navigation from "../Navigation";
import DarkMode from "../ui/DarkMode";

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

  // useEffect(() => {
  //   (async function () {
  //     const user = await getUser();
  //     if (!user) router.push("/login");
  //   })();
  // }, [user]);

  return user ? (
    <div
      className={clsx(
        "flex flex-col min-h-screen pt-navigation-height dark:bg-[#02040F]",
        !disablePadding && "pb-10"
      )}
    >
      <Navigation />
      <DarkMode />
      {children}
      <CurrencyModal />
    </div>
  ) : null;
};

export default Layout;
