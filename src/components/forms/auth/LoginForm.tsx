import { SearchSelect, SearchSelectItem } from "@tremor/react";
import { AppwriteException } from "appwrite";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { ID, account } from "expensasaurus/shared/services/appwrite";
import { useLocaleStore } from "expensasaurus/shared/stores/useLocaleStore";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Field, Form } from "react-final-form";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import Button from "../../ui/Button";
import ErrorMessage from "expensasaurus/components/ui/ErrorMessage";
import InputField from "../../ui/InputField";

type AuthValues = {
  name?: string;
  email?: string;
  currency?: string;
  password?: string;
};

function LoginForm() {
  const { authFormState } = useAuthStore(
    (state) => ({
      authFormState: state.authFormState,
    }),
    shallow
  );

  const { currencies, getCurrencies } = useLocaleStore((state) => ({
    currencies: state.currencies,
    getCurrencies: state.getCurrencies,
  }));

  const isLogin = authFormState === "SIGN_IN";
  const isSignup = authFormState === "SIGN_UP";

  useEffect(() => {
    if (isSignup) {
      getCurrencies();
    }
  }, [isSignup, getCurrencies]);

  const router = useRouter();

  const onSubmit = async (values: AuthValues) => {
    try {
      if (isSignup) {
        await account.create(
          ID.unique(),
          values.email || "",
          values.password || "",
          values.name || ""
        );

        const session = await account.createEmailSession(
          values.email || "",
          values.password || ""
        );

        localStorage.setItem("sessionId", session.$id);

        await account.updatePrefs({
          currency: values.currency,
        });

        toast.success("Welcome to Expensasaurus");
        router.push(ROUTES.BUDGETS);
        return;
      }

      if (isLogin) {
        const session = await account.createEmailSession(
          values.email || "",
          values.password || ""
        );

        const activeSession = await account.getSession(session.$id);
        localStorage.setItem("sessionId", activeSession.$id);

        toast.success("Welcome to Expensasaurus");
        router.push(ROUTES.DASHBOARD);
      }
    } catch (error: unknown) {
      const appwriteError = error as AppwriteException;

      if (appwriteError.code === 401) {
        toast.error("Invalid credentials");
      } else if (appwriteError.code === 409) {
        toast.error("Email already exists");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const validate = (values: AuthValues) => {
    const errors: AuthValues = {};

    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (isSignup && !values.name) {
      errors.name = "Name is required";
    }

    return errors;
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit} className="space-y-2">
          {isSignup && (
            <Field name="name">
              {({ meta, input }) => (
                <InputField
                  variant="auth"
                  extra="mb-1"
                  label="Name*"
                  placeholder="John Doe"
                  id="name"
                  type="text"
                  autoComplete="name"
                  message={meta.touched && meta.error}
                  state={meta.error && meta.touched ? "error" : "idle"}
                  {...input}
                />
              )}
            </Field>
          )}

          <Field name="email">
            {({ meta, input }) => (
              <InputField
                variant="auth"
                extra="mb-1"
                label="Email*"
                placeholder="user@expensasaurus.com"
                id="email"
                type="email"
                autoComplete="email"
                message={meta.touched && meta.error}
                state={meta.error && meta.touched ? "error" : "idle"}
                {...input}
              />
            )}
          </Field>

          {isSignup && currencies && (
            <div className="mb-1">
              <label
                htmlFor="select-currency"
                className="mb-2 ml-1.5 block text-sm font-medium text-slate-700"
              >
                Select Currency*
              </label>
              <Field
                name="currency"
                type="text"
                validate={(value) => (!value ? "Currency is required" : undefined)}
              >
                {({ meta, input }) => (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
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

          <Field type="password" name="password">
            {({ meta, input }) => (
              <InputField
                variant="auth"
                extra="mb-1"
                label="Password*"
                placeholder="Minimum 8 characters"
                id="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                message={meta.touched && meta.error}
                state={meta.error && meta.touched ? "error" : "idle"}
                {...input}
              />
            )}
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            loading={submitting}
            className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>
      )}
    />
  );
}

export default LoginForm;
