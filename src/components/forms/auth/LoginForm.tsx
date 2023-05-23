import Button from "expensasaures/components/ui/Button";
import { useRouter } from "next/router";
import { Field, Form } from "react-final-form";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import { ID, account } from "../../../shared/services/appwrite";
import { useAuthStore } from "../../../shared/stores/useAuthStore";
import InputField from "../../ui/InputField";

function LoginForm() {
  const { authFormState } = useAuthStore(
    (state) => ({
      authFormState: state.authFormState,
    }),
    shallow
  );

  const isLogin = authFormState === "SIGN_IN";
  const isSignup = authFormState === "SIGN_UP";
  const router = useRouter();
  const onSubmit = async (values: any) => {
    try {
      if (isSignup) {
        const response = await account.create(
          ID.unique(),
          values.email,
          values.password,
          values.name
        );
      } else if (isLogin) {
        const response = await account.createEmailSession(
          values.email,
          values.password
        );
        const rest = await account.getSession(response.$id);
        // session ID will be available in the response object
        localStorage.setItem("sessionId", rest.$id);
        // TODO: handle successful sign in
        // route to dashboard
        // show toast.
        toast.success(`Welcome to Expensasaurus`);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validate = (values: any) => {
    const errors: any = {};
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
    if (isSignup) {
      if (!values.name) {
        errors.name = "Name is required";
      }
    }
    return errors;
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <Field name="name">
              {({ meta, input }) => (
                <InputField
                  variant="auth"
                  extra="mb-3"
                  label="Name*"
                  placeholder="John Doe"
                  id="name"
                  type="text"
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
                extra="mb-3"
                label="Email*"
                placeholder="mail@simmmple.com"
                id="email"
                type="text"
                message={meta.touched && meta.error}
                state={meta.error && meta.touched ? "error" : "idle"}
                {...input}
              />
            )}
          </Field>

          <Field name="password">
            {({ meta, input }) => (
              <InputField
                variant="auth"
                extra="mb-3"
                label="Password*"
                placeholder="Min. 8 characters"
                id="password"
                type="password"
                message={meta.touched && meta.error}
                state={meta.error && meta.touched ? "error" : "idle"}
                {...input}
              />
            )}
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Sign In
          </Button>
        </form>
      )}
    />
  );
}

export default LoginForm;
