import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button, SelectBox, SelectBoxItem } from "@tremor/react";
import { Models, Role } from "appwrite";
import { categories } from "expensasaures/shared/constants/categories";
import { ENVS } from "expensasaures/shared/constants/constants";
import {
  ID,
  Permission,
  database,
} from "expensasaures/shared/services/appwrite";
import { getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { validateExpenseForm } from "expensasaures/shared/utils/form";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Field, Form } from "react-final-form";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import FileUpload from "../FileUpload";
import FormInputLabel from "../ui/FormInputLabel";
import InputField from "../ui/InputField";
import TextArea from "../ui/TextArea";
import CategoryIcon from "./CategorySelect";

const ExpenseForm = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };

  const router = useRouter();
  const { id } = router.query;

  const { data } = getDoc<Transaction>(
    ["Expenses by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.EXPENSES, id as string],
    { enabled: false }
  );
  const isUpdateRoute = router.route === "/expenses/[id]/edit";

  const handleSubmit = async (values: Record<string, any>) => {
    const toastMessage = isUpdateRoute
      ? "Expense updated successfully"
      : "Expense created successfully";
    const toastFailureMessage = isUpdateRoute
      ? "Expense updation failed"
      : "Expense creation failed";
    try {
      const permissionsArray = isUpdateRoute
        ? undefined
        : [
            Permission.read(Role.user(user.userId)),
            Permission.update(Role.user(user.userId)),
            Permission.delete(Role.user(user.userId)),
          ];

      const formValues = {
        title: values.title,
        description: values.description,
        amount: values.amount,
        category: values.category,
        tag: values.tag,
        date: values.date,
        userId: user?.userId,
        currency: values.currency,
      };

      const dbIds: [string, string, string] = [
        ENVS.DB_ID,
        ENVS.COLLECTIONS.EXPENSES,
        isUpdateRoute ? (id as string) : ID.unique(),
      ];

      const upsertedExpense = isUpdateRoute
        ? await database.updateDocument(...dbIds, formValues, permissionsArray)
        : await database.createDocument(...dbIds, formValues, permissionsArray);
      toast.success(toastMessage);
    } catch (error) {
      console.log(error);
      toast.error(toastFailureMessage);
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {(isUpdateRoute && data) || !isUpdateRoute ? (
          <Form
            validate={validateExpenseForm}
            onSubmit={handleSubmit}
            initialValues={
              isUpdateRoute
                ? { ...data, date: new Date(data?.date as string) }
                : {
                    title: "",
                    description: "",
                    amount: 0,
                    category: "",
                    tag: "",
                    date: new Date(),
                    attachment: [],
                    currency: "INR",
                  }
            }
          >
            {({ errors, handleSubmit }) => {
              return (
                <div className="w-[800px] flex flex-col gap-4">
                  <form onSubmit={handleSubmit}>
                    <Field
                      name="title"
                      label="Title"
                      type="text"
                      placeholder="Enter title"
                    >
                      {({ meta, input }) => (
                        <InputField
                          extra="mb-3"
                          label="Title*"
                          placeholder="Auto to College"
                          id="title"
                          type="text"
                          message={meta.touched && meta.error}
                          state={meta.error && meta.touched ? "error" : "idle"}
                          {...input}
                        />
                      )}
                    </Field>
                    <Field
                      name="description"
                      label="Description"
                      type="textarea"
                      component={"textarea"}
                      placeholder="Enter description"
                    >
                      {({ meta, input }) => (
                        <>
                          <FormInputLabel htmlFor="description">
                            Description
                          </FormInputLabel>
                          <TextArea
                            id="description"
                            {...input}
                            message={meta.touched && meta.error}
                            error={Boolean(meta.error && meta.touched)}
                          />
                        </>
                      )}
                    </Field>
                    <Field
                      name="amount"
                      label="Amount"
                      type="number"
                      placeholder="Enter amount"
                    >
                      {({ meta, input }) => (
                        <InputField
                          extra="mb-3"
                          label="Amount*"
                          placeholder="50"
                          id="amount"
                          type="number"
                          message={meta.touched && meta.error}
                          state={meta.error && meta.touched ? "error" : "idle"}
                          {...input}
                        />
                      )}
                    </Field>

                    <Field name="category">
                      {({ meta, input }) => (
                        <>
                          <SelectBox
                            onValueChange={(value) =>
                              input.onChange(value as string)
                            }
                            value={input.value}
                          >
                            {categories.map((category, index) => {
                              const CIcon = () => (
                                <CategoryIcon category={category} />
                              );
                              return (
                                <SelectBoxItem
                                  key={category.id}
                                  value={category.key}
                                  text={category.category}
                                  icon={CIcon}
                                />
                              );
                            })}
                          </SelectBox>
                          {meta.touched && meta.error && <p>{meta.error}</p>}
                        </>
                      )}
                    </Field>
                    <Field
                      name="tag"
                      label="Tag"
                      type="text"
                      placeholder="Enter tag"
                    >
                      {({ meta, input }) => (
                        <InputField
                          extra="mb-3"
                          label="Tag*"
                          placeholder="Vacation"
                          id="tag"
                          type="text"
                          message={meta.touched && meta.error}
                          state={meta.error && meta.touched ? "error" : "idle"}
                          {...input}
                        />
                      )}
                    </Field>

                    <Field
                      name="date"
                      component={"input"}
                      label="Date"
                      type="date"
                    >
                      {({ meta, input }) => (
                        <>
                          {JSON.stringify(input.value)}
                          <DesktopDatePicker
                            className="w-full"
                            onChange={(value) =>
                              input.onChange(value?.toISOString())
                            }
                            defaultValue={input.value}
                          />
                        </>
                      )}
                    </Field>
                    <Field name="attachment">
                      {() => (
                        <>
                          <FileUpload />
                        </>
                      )}
                    </Field>
                    <Button
                      size="lg"
                      className="w-full mt-4"
                      variant="primary"
                      type="submit"
                    >
                      Submit
                    </Button>
                  </form>
                </div>
              );
            }}
          </Form>
        ) : null}
      </LocalizationProvider>
    </div>
  );
};

export default dynamic(() => Promise.resolve(ExpenseForm), { ssr: false });
