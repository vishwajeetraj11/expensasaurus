import LoginForm from "expensasaurus/components/forms/auth/LoginForm";
import AuthLayout from "expensasaurus/components/layout/AuthLayout";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { account } from "expensasaurus/shared/services/appwrite";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { BsGithub } from "react-icons/bs";
import { shallow } from "zustand/shallow";

const Signup = () => {
  const { setAuthFormState } = useAuthStore(
    (state) => ({
      setAuthFormState: state.setAuthFormState,
    }),
    shallow
  );

  useEffect(() => {
    setAuthFormState("SIGN_UP");
  }, [setAuthFormState]);

  const continueWithGithub = () => {
    account.createOAuth2Session(
      "github",
      `${window.location.origin}${ROUTES.DASHBOARD}`,
      `${window.location.origin}${ROUTES.HOME}`
    );
  };

  return (
    <AuthLayout>
      <Head>
        <title>Expensasaurus - Sign up</title>
      </Head>

      <div className="mx-auto w-full max-w-[460px] space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
            Create account
          </p>
          <h1 className="max-w-[12ch] text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-white sm:text-4xl">
            Create your account
          </h1>
          <p className="max-w-[56ch] text-base leading-7 text-slate-600 dark:text-slate-300">
            Set up your budget workspace, choose a currency, and keep expense
            entry simple from day one.
          </p>
        </div>

        <button
          type="button"
          onClick={continueWithGithub}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
        >
          <BsGithub className="text-base" />
          Continue with GitHub
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            or
          </p>
          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
        </div>

        <LoginForm />

        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            onClick={() => setAuthFormState("SIGN_IN")}
            className="font-semibold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
