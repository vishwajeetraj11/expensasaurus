import Layout from "expensasaurus/components/layout/Layout";
import CurrencyForm from "expensasaurus/components/profile/currencyForm";
import PasswordForm from "expensasaurus/components/profile/passwordForm";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { defaultOptions } from "expensasaurus/shared/utils/lottie";
import Lottie from "expensasaurus/components/ui/Lottie";
import { shallow } from "zustand/shallow";
import loadingProfile from "../lottie/loadingProfile.json";

const Profile = () => {
  const { userInfo } = useAuthStore(
    (store) => ({ userInfo: store.userInfo }),
    shallow
  );

  return (
    <Layout>
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-16">
        {!userInfo ? (
          <Lottie
            options={defaultOptions(loadingProfile)}
            height={"60vh"}
            width={400}
          />
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-slate-900 text-3xl font-semibold text-white dark:bg-white/10">
                  {(userInfo.name?.[0] || userInfo.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-200">
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Account settings
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Manage your account details, default currency, and password.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Primary email:
                    </span>{" "}
                    {userInfo.email}
                  </p>
                  {userInfo.name && (
                    <p>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        Display name:
                      </span>{" "}
                      {userInfo.name}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Default currency:
                    </span>{" "}
                    {userInfo.prefs?.currency || "INR"}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Currency preferences
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Choose the default currency used in your dashboard and reports.
                  You can still override currency on individual records.
                </p>
                <div className="mt-4">
                  <CurrencyForm changeUI />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Security
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Update your password regularly to keep your account secure.
                </p>
                <div className="mt-4">
                  <PasswordForm />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
