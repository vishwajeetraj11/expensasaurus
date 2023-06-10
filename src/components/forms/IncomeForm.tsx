import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button, Select, SelectItem, TextInput } from "@tremor/react";
import { Models, Role } from "appwrite";
import { incomeCategories } from "expensasaures/shared/constants/categories";
import { ENVS, regex } from "expensasaures/shared/constants/constants";
import {
  ID,
  Permission,
  database
} from "expensasaures/shared/services/appwrite";
import { getDoc } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { defaultMutators, validateExpenseForm } from "expensasaures/shared/utils/form";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Field, Form } from "react-final-form";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import ErrorMessage from "../ui/ErrorMessage";
import FormInputLabel from "../ui/FormInputLabel";
import TextArea from "../ui/TextArea";

const IncomeForm = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const router = useRouter()
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
      amount: values.amount,
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

      toast.success(toastMessage);
      router.push(`/incomes/${upsertedIncome.$id}`)
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
        {(isUpdateRoute && data) || !isUpdateRoute ?
          <Form
            validate={validateExpenseForm}
            onSubmit={handleSubmit}
            mutators={defaultMutators}
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
                          type='text'
                          id="title"
                          disabled={submitting}
                          placeholder={`Enter Title`}
                          error={Boolean(meta.touched && meta.error)}
                          errorMessage={meta.touched && meta.error}
                        /></div>
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
                  >
                    {({ meta, input }) => (
                      <div>
                        <FormInputLabel htmlFor="amount">
                          Amount
                        </FormInputLabel>
                        <TextInput
                          disabled={submitting}
                          id="amount"
                          placeholder="Enter Amount"
                          {...input}
                          value={input.value.toString()}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              form.mutators.setFieldValue(`amount`, 0);
                              return;
                            }
                            if (!regex.number.test(e.target.value)) {
                              return;
                            }
                            form.mutators.setFieldValue(
                              `amount`,
                              e.target.value === "" ? "" : parseInt(e.target.value)
                            );
                          }}
                          type='text'
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
                          placeholder="Select Category"
                          onValueChange={(value) =>
                            input.onChange(value as string)
                          }
                          value={input.value}
                        >
                          {incomeCategories.map((category) => {
                            return (
                              <SelectItem
                                key={category.id}
                                value={category.key}
                                icon={category.Icon}
                              >
                                {category.category}
                              </SelectItem>
                            );
                          })}
                        </Select>
                        {meta.touched && meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
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
                        <FormInputLabel htmlFor="tag">
                          Tag
                        </FormInputLabel>
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
                      <div>
                        <FormInputLabel htmlFor="date">
                          Date
                        </FormInputLabel>
                        <DesktopDatePicker
                          className="w-full"
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
                  >
                    Submit
                  </Button>
                </form>

              );
            }}
          </Form> : null}
      </LocalizationProvider>
    </div>
  );
};

export default dynamic(() => Promise.resolve(IncomeForm), { ssr: false });
