import { SearchSelect, SearchSelectItem } from "@tremor/react";
import { AppwriteException } from "appwrite";
import clsx from "clsx";
import ErrorMessage from "expensasaurus/components/ui/ErrorMessage";
import { account } from "expensasaurus/shared/services/appwrite";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { useLocaleStore } from "expensasaurus/shared/stores/useLocaleStore";
import { useEffect } from "react";
import { Field, Form } from "react-final-form";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import Button from "../ui/Button";

type CurrencyFormValues = {
  currency?: string;
};

const CurrencyForm = (props: { changeUI?: boolean; onClose?: () => void }) => {
  const { changeUI = false, onClose } = props;
  const { userInfo, setUserInfo } = useAuthStore(
    (store) => ({
      userInfo: store.userInfo,
      setUserInfo: store.setUserInfo,
    }),
    shallow
  );

  const { currencies, getCurrencies } = useLocaleStore((state) => ({
    currencies: state.currencies,
    getCurrencies: state.getCurrencies,
  }));

  useEffect(() => {
    getCurrencies();
  }, [getCurrencies]);

  const onSubmit = async (values: CurrencyFormValues) => {
    try {
      const updatedUser = await account.updatePrefs({
        ...(userInfo?.prefs || {}),
        currency: values.currency,
      });
      setUserInfo(updatedUser);
      toast.success("Currency updated");
      onClose?.();
    } catch (error: unknown) {
      const appwriteError = error as AppwriteException;
      toast.error(appwriteError.message || "Unable to save currency");
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{
        currency: userInfo?.prefs?.currency || "INR",
      }}
      render={({ handleSubmit, submitting }) => (
        <form className="space-y-3" onSubmit={handleSubmit}>
          {currencies && (
            <div>
              <label
                htmlFor="select-currency"
                className="mb-2 ml-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Default currency*
              </label>
              <Field
                validate={(value) => {
                  if (!value) {
                    return "Currency is required";
                  }
                }}
                name="currency"
              >
                {({ meta, input }) => (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <SearchSelect
                        placeholder="Select currency"
                        value={input.value}
                        onChange={input.onChange}
                        id="select-currency"
                      >
                        {currencies.currencies.map((currency) => (
                          <SearchSelectItem value={currency.code} key={currency.code}>
                            {currency.name} ({currency.code})
                          </SearchSelectItem>
                        ))}
                      </SearchSelect>
                    </div>
                    {meta.touched && meta.error && (
                      <ErrorMessage>{meta.error}</ErrorMessage>
                    )}
                  </>
                )}
              </Field>
            </div>
          )}

          <div className={clsx("flex", changeUI ? "justify-start" : "justify-end")}>
            <Button
              type="submit"
              disabled={submitting}
              loading={submitting}
              className={clsx(
                "rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800",
                changeUI ? "w-full sm:w-auto" : "w-full"
              )}
            >
              Update currency
            </Button>
          </div>
        </form>
      )}
    />
  );
};

export default CurrencyForm;
