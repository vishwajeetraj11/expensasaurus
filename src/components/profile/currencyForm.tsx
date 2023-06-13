import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { useEffect } from "react";
import { shallow } from "zustand/shallow";

import { Button, SearchSelect, SearchSelectItem } from "@tremor/react";

import clsx from "clsx";
import ErrorMessage from "expensasaurus/components/ui/ErrorMessage";
import { account } from "expensasaurus/shared/services/appwrite";
import { useLocaleStore } from "expensasaurus/shared/stores/useLocaleStore";
import { Field, Form } from "react-final-form";
import { toast } from "sonner";

const CurrencyForm = (props: { changeUI?: boolean; onClose?: () => void }) => {
  const { changeUI = false, onClose } = props;
  const { getUserInfo, userInfo, setUserInfo } = useAuthStore(
    (store) => ({
      getUserInfo: store.getUserInfo,
      userInfo: store.userInfo,
      setUserInfo: store.setUserInfo,
    }),
    shallow
  );

  const bool = changeUI;

  const { currencies, getCurrencies } = useLocaleStore((state) => ({
    currencies: state.currencies,
    getCurrencies: state.getCurrencies,
  }));

  useEffect(() => {
    getCurrencies();
  }, []);

  const onSubmit = async (values: any) => {
    try {
      const updateUser = await account.updatePrefs({
        currency: values.currency,
      });
      setUserInfo(updateUser);
      toast.success(`Welcome to Expensasaurus`);
    } catch (e) {
      toast.error(`Unable to save currency`);
    } finally {
      onClose?.();
    }
  };

  return (
    <>
      <Form
        onSubmit={onSubmit}
        initialValues={{
          currency: "INR",
        }}
        render={({ handleSubmit, submitting }) => (
          <form className={clsx("min-h-[100px]")} onSubmit={handleSubmit}>
            <div
              className={clsx(
                bool ? "flex items-end justify-start gap-10" : ""
              )}
            >
              {currencies && (
                <div className={clsx(bool ? "" : "mb-3")}>
                  <label
                    htmlFor={"select-currency"}
                    className={`text-sm mt-4 text-navy-700 dark:text-white "ml-1.5 font-medium mb-3 block`}
                  >
                    {"Select Currency* (Default Currency is INR)"}
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
                        <SearchSelect
                          placeholder="Select Currency"
                          value={input.value}
                          onChange={input.onChange}
                          id="select-currency"
                        >
                          {currencies?.currencies.map((currency, index) => (
                            <SearchSelectItem value={currency.code} key={index}>
                              {currency.name} ({currency.code})
                            </SearchSelectItem>
                          ))}
                        </SearchSelect>

                        {meta.touched && meta.error && (
                          <ErrorMessage>{meta.error}</ErrorMessage>
                        )}
                      </>
                    )}
                  </Field>
                </div>
              )}
              <div
                className={clsx(
                  "flex justify-end gap-4",
                  !bool ? "mt-[250px]" : ""
                )}
              >
                <Button
                  type="submit"
                  disabled={submitting}
                  loading={submitting}
                  className={clsx(
                    bool ? "" : "mt-2",
                    "w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                  )}
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        )}
      />
    </>
  );
};

export default CurrencyForm;
