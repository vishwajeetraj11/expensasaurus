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
  const { setAuthFormState, authFormState, setUser, setUserInfo } = useAuthStore(
    (state) => ({
      setAuthFormState: state.setAuthFormState,
      authFormState: state.authFormState,
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

  const isSignup = authFormState === "SIGN_UP";

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
        <title>Expensasaurus - Log In to Your Account</title>
      </Head>

      <div className="mx-auto w-full max-w-[460px]">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
          Sign in to keep your budgets updated and continue with Assistant-ready
          transaction tracking.
        </p>

        {demoModeEnabled && (
          <Button
            type="button"
            loading={isUsingDemoAccount}
            disabled={isUsingDemoAccount}
            onClick={useDemoAccount}
            className="mt-7 flex h-12 w-full items-center justify-center rounded-xl !bg-blue-600 !text-white shadow-sm hover:!bg-blue-500"
          >
            {isUsingDemoAccount ? "Opening demo..." : "Use demo account"}
          </Button>
        )}

        <button
          type="button"
          onClick={continueWithGithub}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
        >
          <BsGithub className="text-base" />
          Continue with GitHub
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            or
          </p>
          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
        </div>

        <LoginForm />

        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.SIGNUP}
            onClick={() => setAuthFormState(isSignup ? "SIGN_IN" : "SIGN_UP")}
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
