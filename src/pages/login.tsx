import { FcGoogle } from "react-icons/fc";

import LoginForm from "expensasaures/components/forms/auth/LoginForm";
import AuthLayout from "expensasaures/components/layout/AuthLayout";
import { account } from "expensasaures/shared/services/appwrite";
import { shallow } from "zustand/shallow";
import { useAuthStore } from "../shared/stores/useAuthStore";

export default function SignIn() {
  const { setAuthFormState } = useAuthStore(
    (state) => ({
      setAuthFormState: state.setAuthFormState,
    }),
    shallow
  );

  const onCreateAnAccount = () => {
    setAuthFormState("SIGN_UP");
  };

  return (
    <AuthLayout>
      <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
        {/* Sign in section */}
        <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
          <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
            Sign In
          </h4>
          <p className="mb-9 ml-1 text-base text-gray-600">
            Enter your email and password to sign in!
          </p>
          <div className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-800">
            <div className="rounded-full text-xl">
              <FcGoogle />
            </div>
            <h5 onClick={() => {
              account.createOAuth2Session('github');
            }} className="text-sm font-medium text-navy-700 dark:text-white">
              Sign In with Google
            </h5>
          </div>
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
              Not registered yet?
            </span>
            <button
              onClick={onCreateAnAccount}
              className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
