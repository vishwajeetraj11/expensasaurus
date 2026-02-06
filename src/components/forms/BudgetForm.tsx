import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateRangePicker } from "@tremor/react";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import { Models, Role } from "appwrite";
import { currentMonth } from "expensasaurus/hooks/useDates";
import { ENVS, regex } from "expensasaurus/shared/constants/constants";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import {
  ID,
  Permission,
  database,
} from "expensasaurus/shared/services/appwrite";
import { getDoc } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Budget } from "expensasaurus/shared/types/budget";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import {
  defaultMutators,
  validateAmount,
  validateBudgetForm,
} from "expensasaurus/shared/utils/form";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Field, Form } from "react-final-form";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import SpendingLimitPerCategory from "../budgets/SpendingLimitPerCategory";
import FormInputLabel from "../ui/FormInputLabel";
import TextArea from "../ui/TextArea";

const BudgetForm = () => {
  const { user, userInfo } = useAuthStore(
    (state) => ({ user: state.user, userInfo: state.userInfo }),
    shallow
  ) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>;
  };

  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const { data, refetch } = getDoc<Budget>(
    ["Budget by ID", id, user?.userId],
    [ENVS.DB_ID, ENVS.COLLECTIONS.BUDGETS, id as string],
    { enabled: false }
  );

  const isUpdateRoute = router.route === ROUTES.BUDGET_EDIT;

  const handleSubmit = async (values: Record<string, any>) => {
    const toastMessage = isUpdateRoute
      ? "Budget updated successfully"
      : "Budget created successfully";
    const toastFailureMessage = isUpdateRoute
      ? "Budget updation failed"
      : "Budget creation failed";

    const permissionsArray = isUpdateRoute
      ? undefined
      : [
          Permission.read(Role.user(user.userId)),
          Permission.update(Role.user(user.userId)),
          Permission.delete(Role.user(user.userId)),
        ];

    const dbIds: [string, string, string] = [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.BUDGETS,
      isUpdateRoute ? (id as string) : ID.unique(),
    ];
    try {
      if (values.categories && values.amount) {
        const categorySumsArray = Object.entries(values.categories)
          .filter(([key, value]) => key !== "category")
          .map(([_, value]) => value) as number[];

        const totalCategoriesSum = categorySumsArray.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        );

        if (totalCategoriesSum > values.amount) {
          return;
        } else if (totalCategoriesSum < values.amount) {
          // return
        }
      }

      const categoriesNum = Object.fromEntries(
        Object.entries({
          ...values.categories,
          ...{
            business: values.categories?.business || null,
            entertainment: values.categories?.entertainment || null,
            food: values.categories?.food || null,
            healthcare: values.categories?.healthcare || null,
            education: values.categories?.education || null,
            travel: values.categories?.travel || null,
            other: values.categories?.other || null,
            savings: values.categories?.savings || null,
            housing: values.categories?.housing || null,
            insurance: values.categories?.insurance || null,
            utilities: values.categories?.utilities || null,
            investments: values.categories?.investments || null,
            personal: values.categories?.personal || null,
            transportation: values.categories?.transportation || null,
          },
        }).map(([key, value]) => [
          key,
          Boolean(Number(value)) ? Number(value) : null,
        ])
      );

      const formValues = {
        title: values.title,
        description: values.description,
        userId: user?.userId,
        startingDate: values.dates?.from,
        endDate: values.dates?.to,
        amount: Number(values.amount),
        currency: values.currency,
        ...categoriesNum,
      };

      const upsertedBudget = isUpdateRoute
        ? await database.updateDocument(...dbIds, formValues, permissionsArray)
        : await database.createDocument(...dbIds, formValues, permissionsArray);

      toast.success(toastMessage);
      queryClient.invalidateQueries({ queryKey: ["Budgets", user?.userId] });
      router.push(ROUTES.BUDGETS);
      if (isUpdateRoute && upsertedBudget) {
        refetch();
      }
    } catch (error) {
      toast.error(toastFailureMessage);
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {(isUpdateRoute && data) || !isUpdateRoute ? (
          <Form
            validate={validateBudgetForm}
            onSubmit={handleSubmit}
            mutators={defaultMutators}
            initialValues={
              isUpdateRoute
                ? {
                    ...data,
                    dates: {
                      to: new Date(data?.endDate || new Date()),
                      from: new Date(data?.startingDate || new Date()),
                    },
                    categories: Object.entries({
                      business: data?.business,
                      entertainment: data?.entertainment,
                      food: data?.food,
                      healthcare: data?.healthcare,
                      education: data?.education,
                      travel: data?.travel,
                      other: data?.other,
                      savings: data?.savings,
                      housing: data?.housing,
                      insurance: data?.insurance,
                      utilities: data?.utilities,
                      investments: data?.investments,
                      personal: data?.personal,
                      transportation: data?.transportation,
                    }).reduce<any>((acc, [key, value]) => {
                      if (value !== null) {
                        acc[key] = value;
                      }
                      return acc;
                    }, {}),
                  }
                : {
                    dates: {},
                    title: "",
                    description: "",
                    amount: "",
                    currency: userInfo?.prefs?.currency || "INR",
                    categories: {},
                  }
            }
          >
            {({ errors, values, form, handleSubmit, submitting }) => {
              return (
                <div className="max-w-[500px] mx-auto flex flex-col gap-4">
                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <Field
                      name="dates"
                      component={"input"}
                      label="Date"
                      type="date"
                    >
                      {({ meta, input }) => (
                        <div>
                          <DateRangePicker
                            disabled={submitting}
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
                        </div>
                      )}
                    </Field>

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
                            placeholder={`${currentMonth} Budget`}
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
                          <FormInputLabel htmlFor="amount">
                            Amount
                          </FormInputLabel>
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

                    <Field name="categories">
                      {() => (
                        <>
                          <SpendingLimitPerCategory />
                        </>
                      )}
                    </Field>

                    <Button
                      size="lg"
                      className="w-full mt-10"
                      variant="primary"
                      type="submit"
                      disabled={submitting}
                    >
                      {isUpdateRoute ? "Update" : " Submit"}
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

export default dynamic(() => Promise.resolve(BudgetForm), { ssr: false });
