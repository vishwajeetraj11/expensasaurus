import Button from "expensasaurus/components/ui/Button";
import LoginForm from "expensasaurus/components/forms/auth/LoginForm";
import AuthLayout from "expensasaurus/components/layout/AuthLayout";
import { ensureDemoAccount, isDemoModeEnabled } from "expensasaurus/shared/demo";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { account } from "expensasaurus/shared/services/appwrite";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BsGithub } from "react-icons/bs";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";

const Login = () => {
  const { setAuthFormState, setUser, setUserInfo } = useAuthStore(
    (state) => ({
      setAuthFormState: state.setAuthFormState,
      setUser: state.setUser,
      setUserInfo: state.setUserInfo,
    }),
    shallow
  );
  const router = useRouter();
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [isUsingDemoAccount, setIsUsingDemoAccount] = useState(false);

  useEffect(() => {
    setAuthFormState("SIGN_IN");
  }, [setAuthFormState]);

  useEffect(() => {
    setDemoModeEnabled(isDemoModeEnabled());
  }, []);

  const continueWithGithub = () => {
    account.createOAuth2Session(
      "github",
      `${window.location.origin}${ROUTES.DASHBOARD}`,
      `${window.location.origin}${ROUTES.HOME}`
    );
  };

  const useDemoAccount = async () => {
    setIsUsingDemoAccount(true);

    try {
      const { session, userInfo, created } = await ensureDemoAccount();
      setUser(session);
      setUserInfo(userInfo);
      toast.success(
        created
          ? "Demo account created and ready to showcase."
          : "Signed in to the demo workspace."
      );
      await router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open the demo account right now."
      );
    } finally {
      setIsUsingDemoAccount(false);
    }
  };

  return (
    <AuthLayout>
      <Head>
        <title>Expensasaurus - Log in</title>
      </Head>

      <div className="mx-auto w-full max-w-[460px] space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
            Secure sign in
          </p>
          <h1 className="max-w-[12ch] text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-white sm:text-4xl">
            Welcome back
          </h1>
          <p className="max-w-[56ch] text-base leading-7 text-slate-600 dark:text-slate-300">
            Sign in to review your budgets, log spending, and continue with a
            calmer transaction workflow.
          </p>
        </div>

        <div className="space-y-3">
          {demoModeEnabled && (
            <Button
              type="button"
              loading={isUsingDemoAccount}
              disabled={isUsingDemoAccount}
              onClick={useDemoAccount}
              className="flex h-12 w-full items-center justify-center rounded-xl !bg-blue-600 !text-white shadow-sm transition hover:!bg-blue-500"
            >
              {isUsingDemoAccount ? "Opening demo workspace..." : "Open demo workspace"}
            </Button>
          )}

          <button
            type="button"
            onClick={continueWithGithub}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
          >
            <BsGithub className="text-base" />
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            or
          </p>
          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
        </div>

        <LoginForm />

        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.SIGNUP}
            onClick={() => setAuthFormState("SIGN_UP")}
            className="font-semibold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
