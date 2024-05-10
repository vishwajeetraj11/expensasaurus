import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button, Select, SelectItem, TextInput } from "@tremor/react";
import { Models, Role } from "appwrite";
import useDates from "expensasaurus/hooks/useDates";
import { incomeCategories } from "expensasaurus/shared/constants/categories";
import { ENVS, regex } from "expensasaurus/shared/constants/constants";
import {
  ID,
  Permission,
  database,
} from "expensasaurus/shared/services/appwrite";
import { getDoc } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import {
  defaultMutators,
  validateAmount,
  validateExpenseForm,
} from "expensasaurus/shared/utils/form";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Field, Form } from "react-final-form";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import ErrorMessage from "../ui/ErrorMessage";
import FormInputLabel from "../ui/FormInputLabel";
import TextArea from "../ui/TextArea";
import CategoryIcon from "./CategorySelect";

const IncomeForm = () => {
  const { user, userInfo } = useAuthStore(
    (state) => ({ user: state.user, userInfo: state.userInfo }),
    shallow
  ) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>;
  };
  const { startOfEarlierMonth, startOfThisMonth } = useDates();
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const isUpdateRoute = router.route === "/incomes/[id]/edit";

  const { data } = getDoc<Transaction>(
    ["Income by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.INCOMES, id as string],
    {}
  );

  const handleSubmit = async (values: Record<string, any>) => {
    const toastMessage = isUpdateRoute
      ? "Income updated successfully"
      : "Income created successfully";
    const toastFailureMessage = isUpdateRoute
      ? "Income updation failed"
      : "Income creation failed";
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
      amount: parseFloat(values.amount),
      category: values.category,
      tag: values.tag,
      date: values.date,
      userId: user?.userId,
      currency: values.currency,
    };
    const dbIds: [string, string, string] = [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.INCOMES,
      isUpdateRoute ? (id as string) : ID.unique(),
    ];
    try {
      const upsertedIncome = isUpdateRoute
        ? await database.updateDocument(...dbIds, formValues, permissionsArray)
        : await database.createDocument(...dbIds, formValues, permissionsArray);

      // dashboard query clear.
      // if (new Date(startOfThisMonth) < new Date(values.date)) {
      //   queryClient.invalidateQueries(["Incomes", "Stats this month", user?.userId]);
      // }
      // if (new Date(startOfEarlierMonth) < new Date(values.date) && new Date(values.date) < new Date(startOfThisMonth)) {
      //   queryClient.invalidateQueries(["Incomes", "Stats earlier month", user?.userId]);
      // }
      // listing
      // queryClient.invalidateQueries(["Expenses", "Listing"]);
      queryClient.invalidateQueries(["Expenses"]);
      toast.success(toastMessage);
      router.push(`/incomes/${upsertedIncome.$id}`);
      if (isUpdateRoute) {
        queryClient.invalidateQueries(["Income by ID", id, user?.userId]);
      }
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
            mutators={defaultMutators}
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
                    attachments: [],
                    currency: userInfo?.prefs?.currency || "INR",
                  }
            }
          >
            {({ errors, handleSubmit, submitting, form }) => {
              return (
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <Field
                    name="title"
                    label="Title"
                    type="text"
                    placeholder="Enter title"
                  >
                    {({ meta, input }) => (
                      <div>
                        <FormInputLabel htmlFor="title">Title</FormInputLabel>
                        <TextInput
                          {...input}
                          type="text"
                          id="title"
                          disabled={submitting}
                          placeholder={`Enter Title`}
                          error={Boolean(meta.touched && meta.error)}
                          errorMessage={meta.touched && meta.error}
                        />
                      </div>
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
                      <div>
                        <FormInputLabel htmlFor="description">
                          Description
                        </FormInputLabel>
                        <TextArea
                          disabled={submitting}
                          id="description"
                          {...input}
                          message={meta.touched && meta.error}
                          error={Boolean(meta.error && meta.touched)}
                        />
                      </div>
                    )}
                  </Field>
                  <Field
                    name="amount"
                    label="Amount"
                    type="number"
                    placeholder="Enter amount"
                    validate={validateAmount}
                  >
                    {({ meta, input }) => (
                      <div>
                        <FormInputLabel htmlFor="amount">Amount</FormInputLabel>
                        <TextInput
                          disabled={submitting}
                          id="amount"
                          icon={() => (
                            <span className="pl-2">
                              {
                                formatCurrency(
                                  userInfo?.prefs?.currency,
                                  0
                                ).split("0")[0]
                              }
                            </span>
                          )}
                          placeholder="Enter Amount"
                          {...input}
                          onChange={(e) => {
                            if (
                              e.target.value !== "" &&
                              !regex.numberAndDot.test(e.target.value)
                            ) {
                              return;
                            }
                            input.onChange(e);
                          }}
                          type="text"
                          errorMessage={meta.touched && meta.error}
                          error={Boolean(meta.error && meta.touched)}
                        />
                      </div>
                    )}
                  </Field>

                  <Field name="category">
                    {({ meta, input }) => (
                      <div>
                        <FormInputLabel htmlFor="category">
                          Category
                        </FormInputLabel>
                        <Select
                          disabled={submitting}
                          placeholder="Select Category"
                          onValueChange={(value) =>
                            input.onChange(value as string)
                          }
                          value={input.value}
                        >
                          {incomeCategories.map((category) => {
                            const CIcon = () => (
                              <CategoryIcon category={category} />
                            );
                            return (
                              <SelectItem
                                key={category.id}
                                value={category.key}
                                icon={CIcon}
                              >
                                {category.category}
                              </SelectItem>
                            );
                          })}
                        </Select>
                        {meta.touched && meta.error && (
                          <ErrorMessage>{meta.error}</ErrorMessage>
                        )}
                      </div>
                    )}
                  </Field>
                  <Field
                    name="tag"
                    label="Tag"
                    type="text"
                    placeholder="Enter tag"
                  >
                    {({ meta, input }) => (
                      <div>
                        <FormInputLabel htmlFor="tag">Tag</FormInputLabel>
                        <TextInput
                          disabled={submitting}
                          placeholder="Make your category."
                          id="tag"
                          error={Boolean(meta.touched && meta.error)}
                          errorMessage={meta.touched && meta.error}
                          {...input}
                          type="text"
                        />
                      </div>
                    )}
                  </Field>

                  <Field
                    name="date"
                    component={"input"}
                    label="Date"
                    type="date"
                  >
                    {({ meta, input }) => (
                      <div>
                        <FormInputLabel htmlFor="date">Date</FormInputLabel>
                        <DesktopDatePicker
                          disabled={submitting}
                          className="w-full dark:bg-gray-700 rounded-md"
                          onChange={(value) =>
                            input.onChange(value?.toISOString())
                          }
                          defaultValue={input.value}
                        />
                      </div>
                    )}
                  </Field>

                  <Button
                    size="lg"
                    className="w-full"
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                  >
                    {isUpdateRoute ? "Update" : " Submit"}
                  </Button>
                </form>
              );
            }}
          </Form>
        ) : null}
      </LocalizationProvider>
    </div>
  );
};

export default dynamic(() => Promise.resolve(IncomeForm), { ssr: false });
