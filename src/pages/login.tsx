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

const Login = () => {
  const { setAuthFormState, authFormState } = useAuthStore(
    (state) => ({
      setAuthFormState: state.setAuthFormState,
      authFormState: state.authFormState,
    }),
    shallow
  );

  useEffect(() => {
    setAuthFormState("SIGN_IN");
  }, [setAuthFormState]);

  const isSignup = authFormState === "SIGN_UP";

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
        <title>Expensasaurus - Log In to Your Account</title>
      </Head>

      <div className="mx-auto w-full max-w-[460px]">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          Sign in to keep your budgets updated and continue with Assistant-ready
          transaction tracking.
        </p>

        <button
          type="button"
          onClick={continueWithGithub}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          <BsGithub className="text-base" />
          Continue with GitHub
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px w-full bg-slate-200" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            or
          </p>
          <div className="h-px w-full bg-slate-200" />
        </div>

        <LoginForm />

        <p className="mt-5 text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.SIGNUP}
            onClick={() => setAuthFormState(isSignup ? "SIGN_IN" : "SIGN_UP")}
            className="font-semibold text-cyan-700 transition hover:text-cyan-800"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
