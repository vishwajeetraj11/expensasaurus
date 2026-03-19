import { Models } from "appwrite";
import {
  DEMO_DEFAULTS,
  ensureCurrentDemoSeed,
  getDemoSeedKey,
  getStoredDemoSeedKey,
  isDemoModeEnabled,
  isDemoUser,
} from "expensasaurus/shared/demo";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
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

  const queryClient = useQueryClient();
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [isPreparingDemo, setIsPreparingDemo] = useState(false);
  const [statusText, setStatusText] = useState("Preparing demo workspace...");

  useEffect(() => {
    setDemoModeEnabled(isDemoModeEnabled());
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!demoModeEnabled || !user) {
      setIsPreparingDemo(false);
      return () => {
        isCancelled = true;
      };
    }

    if (!userInfo) {
      setStatusText("Loading account...");
      setIsPreparingDemo(true);
      void getUserInfo();
      return () => {
        isCancelled = true;
      };
    }

    if (!isDemoUser(userInfo)) {
      setIsPreparingDemo(false);
      return () => {
        isCancelled = true;
      };
    }

    const currencyPreference =
      typeof userInfo.prefs?.currency === "string" && userInfo.prefs.currency.trim()
        ? userInfo.prefs.currency.trim().toUpperCase()
        : DEMO_DEFAULTS.currency;
    const targetSeedKey = getDemoSeedKey(new Date());
    const storedSeedKey = getStoredDemoSeedKey();

    if (storedSeedKey === targetSeedKey) {
      setIsPreparingDemo(false);
      return () => {
        isCancelled = true;
      };
    }

    setStatusText("Preparing demo workspace...");
    setIsPreparingDemo(true);

    void ensureCurrentDemoSeed({
      userId: user.userId,
      currency: currencyPreference,
    })
      .then((result) => {
        if (isCancelled) return;

        queryClient.clear();
        setIsPreparingDemo(false);

        if (
          result.seedKey === targetSeedKey &&
          (result.expenses > 0 || result.incomes > 0 || result.budgets > 0)
        ) {
          toast.success(
            `Demo workspace refreshed with ${result.expenses} expenses, ${result.incomes} incomes, and ${result.budgets} budgets.`
          );
        }
      })
      .catch((error) => {
        if (isCancelled) return;
        setIsPreparingDemo(false);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not prepare the demo workspace."
        );
      });

    return () => {
      isCancelled = true;
    };
  }, [demoModeEnabled, getUserInfo, queryClient, user, userInfo]);

  if (!isPreparingDemo) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[720px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      <h2 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">
        Demo mode
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
        {statusText} We only do this for the demo account so your showcase
        always opens with fresh, current-month data.
      </p>
    </div>
  );
};

export default DemoBootstrapGate;
