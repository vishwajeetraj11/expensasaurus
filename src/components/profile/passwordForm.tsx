import { AppwriteException } from "appwrite";
import { account } from "expensasaurus/shared/services/appwrite";
import { Field, Form } from "react-final-form";
import { toast } from "sonner";
import Button from "../ui/Button";
import InputField from "../ui/InputField";

type PasswordFormValues = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const validate = (values: PasswordFormValues) => {
  const errors: PasswordFormValues = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters long";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

const PasswordForm = () => {
  const onSubmit = async (values: PasswordFormValues, form: any) => {
    try {
      await account.updatePassword(
        values.newPassword || "",
        values.currentPassword || ""
      );
      toast.success("Password updated");
      form.reset();
    } catch (error: unknown) {
      const appwriteError = error as AppwriteException;
      if (appwriteError.code === 401) {
        toast.error("Current password is incorrect");
      } else {
        toast.error(appwriteError.message || "Unable to update password");
      }
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit, submitting }) => (
        <form className="space-y-2" onSubmit={handleSubmit}>
          <Field name="currentPassword">
            {({ meta, input }) => (
              <InputField
                variant="auth"
                extra="mb-1"
                label="Current password*"
                placeholder="Enter your current password"
                id="current-password"
                type="password"
                autoComplete="current-password"
                message={meta.touched && meta.error}
                state={meta.error && meta.touched ? "error" : "idle"}
                {...input}
              />
            )}
          </Field>

          <Field name="newPassword">
            {({ meta, input }) => (
              <InputField
                variant="auth"
                extra="mb-1"
                label="New password*"
                placeholder="Use at least 8 characters"
                id="new-password"
                type="password"
                autoComplete="new-password"
                message={meta.touched && meta.error}
                state={meta.error && meta.touched ? "error" : "idle"}
                {...input}
              />
            )}
          </Field>

          <Field name="confirmPassword">
            {({ meta, input }) => (
              <InputField
                variant="auth"
                extra="mb-1"
                label="Confirm new password*"
                placeholder="Enter the new password again"
                id="confirm-password"
                type="password"
                autoComplete="new-password"
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
            className="mt-3 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Update password
          </Button>
        </form>
      )}
    />
  );
};

export default PasswordForm;
