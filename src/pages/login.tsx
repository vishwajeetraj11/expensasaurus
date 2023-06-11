import LoginForm from "expensasaures/components/forms/auth/LoginForm";
import AuthLayout from "expensasaures/components/layout/AuthLayout";
import MainLayout from "expensasaures/components/layout/MainLayout";
import { account } from "expensasaures/shared/services/appwrite";
import Head from "next/head";
import { BsGithub } from "react-icons/bs";
import { shallow } from "zustand/shallow";
import { useAuthStore } from "../shared/stores/useAuthStore";

const Login = () => {
  const { setAuthFormState, authFormState, user } = useAuthStore(
    (state) => ({
      setAuthFormState: state.setAuthFormState,
      authFormState: state.authFormState,
      user: state.user
    }),
    shallow
  );


  const isLogin = authFormState === "SIGN_IN";
  const isSignup = authFormState === "SIGN_UP";

  const onCreateAnAccount = () => {
    setAuthFormState(authFormState === "SIGN_UP" ? 'SIGN_IN' : 'SIGN_UP');
  };
  // set currency in user prefs.on signup
  return (
    <MainLayout>
      <AuthLayout
      >
        <Head>
          <title>Expensasaures - Log In to Your Account</title>
        </Head>
        <div className="mt-0 md:mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          {/* Sign in section */}
          <div className="mt-4 md:mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
              {isSignup ? 'Create an account' : 'Sign In'}
            </h4>
            <p className="mb-9 ml-1 text-base text-gray-600">
              {isSignup ? 'Create an account to start tracking your expenses like a pro!' : 'Securely access your Expense Tracker account.'}
            </p>

            <button type='button' onClick={() => {
              account.createOAuth2Session('github', `${window.location.origin}/dashboard`, `${window.location.origin}/`);
            }} className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-700">
              <div className="rounded-full text-xl">
                <BsGithub className="dark:text-white" />
              </div>
              <h5 className="text-sm font-medium text-navy-700 dark:text-white">
                Continue with Github
              </h5>
            </button>
            <div className="mb-6 flex items-center  gap-3">
              <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
              <p className="text-base text-gray-600 dark:text-white"> or </p>
              <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
            </div>
            <LoginForm />

            {/* Checkbox */}
            {/* <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex items-center">
              <Checkbox />
              <p className="ml-2 text-sm font-medium text-navy-700 dark:text-white">
                Keep me logged In
              </p>
            </div>
            <a
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
              href=" "
            >
              Forgot Password?
            </a>
          </div> */}

            <div className="mt-4">
              <span className=" text-sm font-medium text-navy-700 dark:text-gray-600">
                {isSignup ? 'Already have an account?' : 'Not registered yet?'}
              </span>
              <button
                onClick={onCreateAnAccount}
                className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
              >
                {isSignup ? 'Sign In' : 'Create an account'}
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    </MainLayout>
  );
}

export default Login