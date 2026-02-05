import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import Select, { SelectItem } from "../ui/Select";
import { Models, Role } from "appwrite";
import useDates from "expensasaurus/hooks/useDates";
import { categories } from "expensasaurus/shared/constants/categories";
import { ENVS, regex } from "expensasaurus/shared/constants/constants";
import {
  ID,
  Permission,
  database,
  storage,
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
import { useQueries, useQueryClient } from "react-query";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import FileUpload from "../FileUpload";
import ErrorMessage from "../ui/ErrorMessage";
import FormInputLabel from "../ui/FormInputLabel";
import TextArea from "../ui/TextArea";
import CategoryIcon from "./CategorySelect";

const ExpenseForm = () => {
  const { user, userInfo } = useAuthStore(
    (state) => ({ user: state.user, userInfo: state.userInfo }),
    shallow
  ) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>;
  };

  const router = useRouter();
  const { id } = router.query;
  const { startOfEarlierMonth, startOfThisMonth } = useDates();
  const { data, refetch } = getDoc<Transaction>(
    ["Expenses by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.EXPENSES, id as string],
    { enabled: false }
  );

  const attachments = data?.attachments || [];

  const filePreviews = useQueries(
    attachments.map((id) => ({
      queryKey: ["get-file-preview", id, user.userId],
      queryFn: async () => {
        return storage.getFilePreview(ENVS.BUCKET_ID, id);
      },
      enabled: !!user && !!data,
    }))
  );
  const queryClient = useQueryClient();

  const isUpdateRoute = router.route === "/expenses/[id]/edit";

  const handleSubmit = async (values: Record<string, any>) => {
    // setLoading(true)
    const toastMessage = isUpdateRoute
      ? "Expense updated successfully"
      : "Expense created successfully";
    const toastFailureMessage = isUpdateRoute
      ? "Expense updation failed"
      : "Expense creation failed";
    let attachements = values.attachments;

    let attachmentsIds: string[] = [];
    let promises = [];
    if (attachements.length > 0) {
      for (let i = 0; i < attachements.length; i++) {
        const file = attachements[i];
        if (typeof file === "string") {
          attachmentsIds.push(file);
          continue;
        }
        promises.push(storage.createFile(ENVS.BUCKET_ID, ID.unique(), file));
      }
    }

    try {
      const permissionsArray = isUpdateRoute
        ? undefined
        : [
            Permission.read(Role.user(user.userId)),
            Permission.update(Role.user(user.userId)),
            Permission.delete(Role.user(user.userId)),
          ];

      const dbIds: [string, string, string] = [
        ENVS.DB_ID,
        ENVS.COLLECTIONS.EXPENSES,
        isUpdateRoute ? (id as string) : ID.unique(),
      ];
      const files = await Promise.all(promises);
      attachmentsIds = attachmentsIds.concat(files.map((file) => file.$id));

      const formValues = {
        title: values.title,
        description: values.description,
        amount: parseFloat(values.amount),
        category: values.category,
        tag: values.tag,
        date: values.date?.toISOString(),
        userId: user?.userId,
        currency: values.currency,
        attachments: attachmentsIds.length > 0 ? attachmentsIds : undefined,
      };

      const upsertedExpense = isUpdateRoute
        ? await database.updateDocument(...dbIds, formValues, permissionsArray)
        : await database.createDocument(...dbIds, formValues, permissionsArray);

      // dashboard page
      if (new Date(startOfThisMonth) < new Date(values.date)) {
        // queryClient.invalidateQueries(["Expenses", "Stats this month", user?.userId]);
      }
      if (
        new Date(startOfEarlierMonth) < new Date(values.date) &&
        new Date(values.date) < new Date(startOfThisMonth)
      ) {
        // queryClient.invalidateQueries(["Expenses", "Stats earlier month", user?.userId]);
      }
      // category page
      // queryClient.invalidateQueries(["Expenses", user?.userId, values.date]);
      // listing
      // queryClient.invalidateQueries(["Expenses", "Listing"]);
      queryClient.invalidateQueries(["Expenses"]);
      router.push(`/expenses/${upsertedExpense.$id}`);
      toast.success(toastMessage);
      if (isUpdateRoute && upsertedExpense) {
        // indvidual expense page
        queryClient.invalidateQueries(["Expenses by ID", id, user?.userId]);
        refetch();
      }
    } catch (error) {
      toast.error(toastFailureMessage);
    } finally {
      // setLoading(false) do not use -> forces reredner causing form intial values to be reset
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {(isUpdateRoute && data) || !isUpdateRoute ? (
          <Form
            mutators={defaultMutators}
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
                    attachments: [],
                    currency: userInfo?.prefs?.currency || "INR",
                  }
            }
          >
            {({ errors, handleSubmit, submitting, form, values }) => {
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
                          disabled={submitting}
                          id="amount"
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
                          onValueChange={(value) =>
                            input.onChange(value as string)
                          }
                          disabled={submitting}
                          value={input.value}
                        >
                          {categories.map((category, index) => {
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
                      <div className="">
                        <FormInputLabel htmlFor="category">Date</FormInputLabel>
                        <DesktopDatePicker
                          disabled={submitting}
                          className="w-full dark:bg-gray-700 rounded-md"
                          onChange={(value) => input.onChange(value)}
                          defaultValue={input.value}
                        />
                      </div>
                    )}
                  </Field>
                  <Field name="attachments">
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

export default dynamic(() => Promise.resolve(ExpenseForm), { ssr: false });
