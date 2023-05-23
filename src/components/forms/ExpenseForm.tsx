import React from "react";
import { Field, Form } from "react-final-form";
import InputField from "../ui/InputField";
import TextArea from "../ui/TextArea";
import FormInputLabel from "../ui/FormInputLabel";
import { Button, SelectBox, SelectBoxItem } from "@tremor/react";
import { BiBarChart } from "react-icons/bi";
import { parseISO } from "date-fns";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FileUpload from "../FileUpload";
import { validateExpenseForm } from "expensasaures/shared/utils/form";
import { categories } from "expensasaures/shared/constants/categories";
import {
  ID,
  Permission,
  database,
} from "expensasaures/shared/services/appwrite";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { shallow } from "zustand/shallow";
import { Models, Role } from "appwrite";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const ExpenseForm = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      const createdExpense = await database.createDocument(
        "6467f9811c14ca905ed5",
        "6467f98b8e8fe5ffa576",
        ID.unique(),
        {
          title: values.title,
          description: values.description,
          amount: values.amount,
          category: values.category.toLowerCase(),
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
          validate={validateExpenseForm}
          onSubmit={handleSubmit}
          initialValues={{
            title: "",
            description: "",
            amount: 0,
            category: "",
            tag: "",
            date: new Date(),
            attachment: [],
            currency: "INR",
          }}
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
                          defaultValue="1"
                        >
                          {categories.map((category) => {
                            return (
                              <SelectBoxItem
                                key={category.id}
                                value={category.category.toLowerCase()}
                                text={category.category}
                                icon={category.Icon}
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

export default dynamic(() => Promise.resolve(ExpenseForm), { ssr: false });