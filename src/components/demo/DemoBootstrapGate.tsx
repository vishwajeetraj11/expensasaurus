import { Models } from "appwrite";
import {
  isDemoModeEnabled,
  isDemoUser,
} from "expensasaurus/shared/demo";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import React, { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";

type Props = {
  children: React.ReactNode;
};

const DemoBootstrapGate = ({ children }: Props) => {
  const { user, userInfo, getUserInfo } = useAuthStore(
    (store) => ({
      user: store.user,
      userInfo: store.userInfo,
      getUserInfo: store.getUserInfo,
    }),
    shallow
  ) as {
    user: Models.Session | null;
    userInfo: Models.User<Models.Preferences> | null;
    getUserInfo: () => Promise<void>;
  };

  const [demoModeEnabled, setDemoModeEnabled] = useState(false);

  useEffect(() => {
    setDemoModeEnabled(isDemoModeEnabled());
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!demoModeEnabled || !user) {
      return () => {
        isCancelled = true;
      };
    }

    if (!userInfo) {
      void getUserInfo();
      return () => {
        isCancelled = true;
      };
    }

    if (!isDemoUser(userInfo)) {
      return () => {
        isCancelled = true;
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [demoModeEnabled, getUserInfo, user, userInfo]);

  return <>{children}</>;
};

export default DemoBootstrapGate;
