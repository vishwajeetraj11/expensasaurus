import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button, DateRangePicker } from "@tremor/react";
import { Models, Role } from "appwrite";
import { ENVS } from "expensasaures/shared/constants/constants";
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
      if (values.categories && values.amount) {
        const categorySumsArray = Object.entries(values.categories).map(
          ([_, value]) => value
        ) as number[];

        const totalCategoriesSum = categorySumsArray.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        );

        if (totalCategoriesSum > values.amount) {
          // return toast.error("Total category sum cannot be greater than amount");
          return;
        }
      }

      const categoriesNum = Object.fromEntries(
        Object.entries(values.categories).map(([key, value]) => [
          key,
          Number(value),
        ])
      );

      const createdBudget = await database.createDocument(
        ENVS.DB_ID,
        ENVS.COLLECTIONS.BUDGETS,
        ID.unique(),
        {
          title: values.title,
          description: values.description,
          userId: user?.userId,
          startingDate: values.dates[0],
          endDate: values.dates[1],
          amount: Number(values.amount),
          currency: values.currency,
          ...categoriesNum,
        },
        [
          Permission.read(Role.user(user.userId)),
          Permission.update(Role.user(user.userId)),
          Permission.delete(Role.user(user.userId)),
        ]
      );

      toast.success("Budget created successfully");
    } catch (error) {
      console.log(error);
      toast.error("Budget creation failed");
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form
          validate={validateBudgetForm}
          onSubmit={handleSubmit}
          mutators={defaultMutators}
          initialValues={{
            dates: [],
            title: "",
            description: "",
            amount: "",
            currency: "INR",
            categories: {},
          }}
        >
          {({ errors, values, handleSubmit }) => {
            return (
              <div className="max-w-[500px] mx-auto flex flex-col gap-4">
                <form onSubmit={handleSubmit}>
                  <Field
                    name="dates"
                    component={"input"}
                    label="Date"
                    type="date"
                  >
                    {({ meta, input }) => (
                      <>
                        <DateRangePicker
                          // minDate={new Date()}
                          value={input.value}
                          onValueChange={(value) => {
                            input.onChange(value);
                          }}
                        />
                        {meta.touched && meta.error && (
                          <p className="text-xs text-red-500 mt-2">
                            {meta.error}
                          </p>
                        )}
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

                  <Field name="categories">
                    {({ meta }) => (
                      <>
                        <SpendingLimitPerCategory />
                        {meta.touched && meta.error && (
                          <p className="text-xs text-red-500 mt-2">
                            {meta.error}
                          </p>
                        )}
                      </>
                    )}
                  </Field>

                  <Button
                    size="lg"
                    className="w-full mt-10"
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
