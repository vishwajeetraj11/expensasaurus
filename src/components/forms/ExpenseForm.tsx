import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button, Select, SelectItem } from "@tremor/react";
import { Models, Role } from "appwrite";
import { categories } from "expensasaures/shared/constants/categories";
import { ENVS } from "expensasaures/shared/constants/constants";
import {
  ID,
  Permission,
  database,
  storage
} from "expensasaures/shared/services/appwrite";
import { getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { validateExpenseForm } from "expensasaures/shared/utils/form";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { Field, Form } from "react-final-form";
import { useQueries, useQueryClient } from "react-query";
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
  const [loading, setLoading] = useState(false)

  const attachments = data?.attachments || [];

  const filePreviews = useQueries(attachments.map(id => ({
    queryKey: ['get-file-preview', id, user.userId],
    queryFn: async () => {
      return storage.getFilePreview(ENVS.BUCKET_ID, id);
    },
    enabled: !!user && !!data
  })));
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
        if (typeof file === 'string') {
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
        amount: values.amount,
        category: values.category,
        tag: values.tag,
        date: values.date,
        userId: user?.userId,
        currency: values.currency,
        attachments: attachmentsIds.length > 0 ? attachmentsIds : undefined,
      };

      const upsertedExpense = isUpdateRoute
        ? await database.updateDocument(...dbIds, formValues, permissionsArray)
        : await database.createDocument(...dbIds, formValues, permissionsArray);
      toast.success(toastMessage);
      queryClient.invalidateQueries(["Expenses by ID", id, user?.userId]);
      router.push(`/expenses/${upsertedExpense.$id}`);
    } catch (error) {
      console.log(error);
      toast.error(toastFailureMessage);
    }
    finally {
      // setLoading(false) do not use -> forces reredner causing form intial values to be reset
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
                :
                {
                  title: "",
                  description: "",
                  amount: 0,
                  category: "",
                  tag: "",
                  date: new Date(),
                  attachments: [],
                  currency: "INR",
                }
            }
          >
            {({ errors, handleSubmit, submitting }) => {
              return (
                <div className="flex flex-col gap-4">
                  <form onSubmit={handleSubmit}>
                    <Field
                      name="title"
                      label="Title"
                      type="text"
                      placeholder="Enter title"
                    >
                      {({ meta, input }) => (
                        <InputField
                          disabled={submitting}
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
                          <FormInputLabel className="ml-3 font-bold text-sm text-navy-700 dark:text-white" htmlFor="description">
                            Description
                          </FormInputLabel>
                          <TextArea
                            id="description"
                            disabled={submitting}
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
                          disabled={submitting}
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
                          disabled={submitting}
                          extra="mb-3"
                          label="Tag"
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
                          <DesktopDatePicker
                            disabled={submitting}
                            className="w-full"
                            onChange={(value) =>
                              input.onChange(value?.toISOString())
                            }
                            defaultValue={input.value}
                          />
                        </>
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
