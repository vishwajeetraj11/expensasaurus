import clsx from "clsx";
import DemoBootstrapGate from "expensasaurus/components/demo/DemoBootstrapGate";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
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
  const { user } = useAuthStore((store) => ({ user: store.user }), shallow);

  return user ? (
    <div
      className={clsx(
        "flex flex-col pt-navigation-height dark:bg-[#02040F]",
        disablePadding ? "min-h-screen" : "min-h-screen pb-10"
      )}
    >
      <Navigation />
      <DarkMode />
      <DemoBootstrapGate>{children}</DemoBootstrapGate>
      <CurrencyModal />
    </div>
  ) : null;
};

export default Layout;
