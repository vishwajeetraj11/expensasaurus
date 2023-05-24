import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button, DateRangePicker } from "@tremor/react";
import { Models, Role } from "appwrite";
import {
  ID,
  Permission,
  database,
} from "expensasaures/shared/services/appwrite";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import {
  defaultMutators,
  validateBudgetForm,
} from "expensasaures/shared/utils/form";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Field, Form } from "react-final-form";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import SpendingLimitPerCategory from "../budgets/SpendingLimitPerCategory";
import FormInputLabel from "../ui/FormInputLabel";
import InputField from "../ui/InputField";
import TextArea from "../ui/TextArea";

const BudgetForm = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      const createdBudget = await database.createDocument(
        "6467f9811c14ca905ed5",
        "6467f98b8e8fe5ffa576",
        ID.unique(),
        {
          title: values.title,
          description: values.description,
          amount: values.amount,
          category: values.category,
          tag: values.tag,
          date: values.date,
          userId: user?.userId,
          currency: values.currency,
        },
        [
          Permission.read(Role.user(user.userId)),
          Permission.update(Role.user(user.userId)),
          Permission.delete(Role.user(user.userId)),
        ]
      );
      toast.success("Expense created successfully");
    } catch (error) {
      console.log(error);
      toast.error("Expense creation failed");
    }
  };

  return (
    <div>
      <Link href={"/expenses"}>Expenses</Link>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form
          validate={validateBudgetForm}
          onSubmit={handleSubmit}
          mutators={defaultMutators}
          initialValues={{
            dates: [],
            categories: {},
          }}
        >
          {({ errors, handleSubmit }) => {
            return (
              <div className="w-[800px] flex flex-col gap-4">
                <form onSubmit={handleSubmit}>
                  <Field
                    name="date"
                    component={"input"}
                    label="Date"
                    type="date"
                  >
                    {({ meta, input }) => (
                      <>
                        <DateRangePicker
                          className="max-w-md mx-auto"
                          value={input.value}
                          onValueChange={(value) => {
                            input.onChange(value);
                          }}
                        />
                      </>
                    )}
                  </Field>
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
                        placeholder="₹ 1.00"
                        id="amount"
                        type="number"
                        message={meta.touched && meta.error}
                        state={meta.error && meta.touched ? "error" : "idle"}
                        {...input}
                      />
                    )}
                  </Field>

                  <Field name="category">
                    {() => <SpendingLimitPerCategory />}
                  </Field>

                  <Button
                    size="lg"
                    className="w-full"
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
      </LocalizationProvider>
    </div>
  );
};

export default dynamic(() => Promise.resolve(BudgetForm), { ssr: false });
