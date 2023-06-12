import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import Link from "next/link";
import { shallow } from "zustand/shallow";
import DarkMode from "../ui/DarkMode";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { authFormState } = useAuthStore(
    (state) => ({
      authFormState: state.authFormState,
    }),
    shallow
  );

  const isLogin = authFormState === "SIGN_IN";
  const isSignup = authFormState === "SIGN_UP";

  return (
    <div>
      <div className="relative float-right h-full min-h-screen w-full !bg-white dark:!bg-navy-900">
        <DarkMode />
        <main className={`mx-auto min-h-screen`}>
          <div className="relative flex">
            <div className="mx-auto flex min-h-full w-full flex-col justify-start pt-12 md:max-w-[75%] lg:h-screen lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]">
              <div className="mb-auto flex flex-col pl-5 pr-5 md:pr-0 md:pl-12 lg:max-w-[48%] lg:pl-0 xl:max-w-full">
                <Link href="/" className="mt-0 w-max lg:pt-10">
                  <div className="mx-auto flex h-fit w-fit items-center hover:cursor-pointer">
                    <svg
                      width="8"
                      height="12"
                      viewBox="0 0 8 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.70994 2.11997L2.82994 5.99997L6.70994 9.87997C7.09994 10.27 7.09994 10.9 6.70994 11.29C6.31994 11.68 5.68994 11.68 5.29994 11.29L0.709941 6.69997C0.319941 6.30997 0.319941 5.67997 0.709941 5.28997L5.29994 0.699971C5.68994 0.309971 6.31994 0.309971 6.70994 0.699971C7.08994 1.08997 7.09994 1.72997 6.70994 2.11997V2.11997Z"
                        fill="#A3AED0"
                      />
                    </svg>
                    <p className="ml-3 text-sm text-gray-600">
                      Back
                    </p>
                  </div>
                </Link>
                {children}
                <div className="absolute right-0 hidden h-full min-h-screen md:block lg:w-[49vw] 2xl:w-[44vw]">
                  <div
                    className="absolute flex flex-col h-full w-full px-10 justify-center bg-cover bg-center lg:rounded-bl-[120px] xl:rounded-bl-[200px]"
                    style={{ backgroundImage: `url(/img/auth/auth.png)` }}
                  >
                    <p className="text-white font-thin text-[40px]">
                      {isSignup ? `Elevate Your Financial Lifestyle` : 'Welcome Back to Your Financial Kingdom'}
                    </p>
                    <p className="text-[#f4f4f4] text-[22px] pt-20 max-w-[80%]">
                      {isSignup ? `Seamlessly track your expenses, optimize your spending, and make informed financial decisions like never before.
                      Take control of your wealth and embark on a journey towards unparalleled financial freedom!`: `
                      Step into your financial kingdom with ease and convenience.
                      As a valued member of our exclusive expense tracking platform, your journey continues here.
                      Simply enter your login credentials to access a world of financial insights and control. 
                      `}
                    </p>
                  </div>
                </div>
              </div>
              {/* <Footer /> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
