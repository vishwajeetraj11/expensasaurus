import { Models } from "appwrite";
import Button from "expensasaurus/components/ui/Button";
import {
  DEMO_DEFAULTS,
  ensureDemoAccount,
  getDemoSeedKey,
  isDemoModeEnabled,
  isDemoUser,
  resetDemoData,
  setStoredDemoSeedKey,
} from "expensasaurus/shared/demo";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";

const SeedPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, userInfo, getUserInfo, setUser, setUserInfo } = useAuthStore(
    (store) => ({
      user: store.user,
      userInfo: store.userInfo,
      getUserInfo: store.getUserInfo,
      setUser: store.setUser,
      setUserInfo: store.setUserInfo,
    }),
    shallow
  ) as {
    user: Models.Session | null;
    userInfo: Models.User<Models.Preferences> | null;
    getUserInfo: () => Promise<void>;
    setUser: (user: Models.Session | null) => void;
    setUserInfo: (userInfo: Models.User<Models.Preferences> | null) => void;
  };
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setDemoModeEnabled(isDemoModeEnabled());
  }, []);

  useEffect(() => {
    if (user && !userInfo) {
      void getUserInfo();
    }
  }, [getUserInfo, user, userInfo]);

  const currentSeedKey = useMemo(() => getDemoSeedKey(new Date()), []);

  const syncDemoSession = async () => {
    const result = await ensureDemoAccount();
    setUser(result.session);
    setUserInfo(result.userInfo);
    return result;
  };

  const handleUseDemoAccount = async () => {
    setIsBootstrapping(true);

    try {
      const result = await syncDemoSession();
      toast.success(
        result.created
          ? "Demo account created successfully."
          : "Signed in to the demo account."
      );
      await router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to prepare the demo account."
      );
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleResetDemoData = async () => {
    setIsResetting(true);

    try {
      const activeDemoSession =
        user && userInfo && isDemoUser(userInfo)
          ? { session: user, userInfo }
          : await syncDemoSession();

      const currencyPreference =
        typeof activeDemoSession.userInfo.prefs?.currency === "string" &&
        activeDemoSession.userInfo.prefs.currency.trim()
          ? activeDemoSession.userInfo.prefs.currency.trim().toUpperCase()
          : DEMO_DEFAULTS.currency;

      const result = await resetDemoData({
        userId: activeDemoSession.session.userId,
        currency: currencyPreference,
      });

      setStoredDemoSeedKey(result.seedKey);
      queryClient.clear();
      toast.success(
        `Reset demo data with ${result.expenses} expenses, ${result.incomes} incomes, and ${result.budgets} budgets.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reset demo data."
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Expensasaurus - Demo Seed</title>
      </Head>

      <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-[#02040F]">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
              Demo control
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
              Showcase workspace
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              This page is for demo environments. We can create the fixed demo
              account, sign in as that user, and rebuild the seeded data so the
              dashboard always looks current.
            </p>
          </section>

          {!demoModeEnabled ? (
            <section className="rounded-3xl border border-amber-200/80 bg-amber-50 p-6 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
              <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                Demo mode is off
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-800/90 dark:text-amber-100/80">
                Enable <code>NEXT_PUBLIC_DEMO_MODE=true</code> in this environment
                to use the demo bootstrap flow.
              </p>
            </section>
          ) : (
            <>
              <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Credentials
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {DEMO_DEFAULTS.email}
                    </p>
                    <p>
                      <span className="font-semibold">Password:</span>{" "}
                      {DEMO_DEFAULTS.password}
                    </p>
                    <p>
                      <span className="font-semibold">Currency:</span>{" "}
                      {DEMO_DEFAULTS.currency}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Seed state
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <p>
                      <span className="font-semibold">Current month key:</span>{" "}
                      {currentSeedKey}
                    </p>
                    <p>
                      <span className="font-semibold">Signed in as demo:</span>{" "}
                      {userInfo && isDemoUser(userInfo) ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    loading={isBootstrapping}
                    disabled={isBootstrapping || isResetting}
                    onClick={handleUseDemoAccount}
                    className="!bg-blue-600 !text-white hover:!bg-blue-500"
                  >
                    {isBootstrapping ? "Opening demo..." : "Use demo account"}
                  </Button>
                  <Button
                    type="button"
                    loading={isResetting}
                    disabled={isBootstrapping || isResetting}
                    onClick={handleResetDemoData}
                    variant="secondary"
                  >
                    {isResetting ? "Resetting data..." : "Reset demo data"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push(ROUTES.DASHBOARD)}
                  >
                    Open dashboard
                  </Button>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Resetting wipes the demo user&apos;s expenses, incomes, and budgets,
                  then rebuilds them relative to today so every interview starts with
                  a fresh-looking workspace.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SeedPage;
