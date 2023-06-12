import {
  Button,
  Flex,
  Select,
  SelectItem,
  Text,
  TextInput,
} from "@tremor/react";
import { categories } from "expensasaurus/shared/constants/categories";
import { regex } from "expensasaurus/shared/constants/constants";
import { capitalize } from "expensasaurus/shared/utils/common";
import { Fragment } from "react";
import { useField, useForm } from "react-final-form";
import CategoryIcon from "../forms/CategorySelect";
import DeleteButton from "../icons/DeleteButton";

const SpendingLimitPerCategory = () => {
  const form = useForm();
  const formState = form.getState();
  const { input, meta } = useField("categories");
  const category = formState.values.categories as Record<string, number>;
  const amount = formState.values.amount;

  const onAddCategory = () => {
    if (category["category"]) {
      return;
    }
    const res = { ...category };
    res["category"] = 0;
    form.mutators.setFieldValue("categories", res);
  };
  const totalCategoriesSum = Object.entries(category)
    .map(([_, value]) => value)
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue
    }, 0);

  const submitting = formState.submitting

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <Text>Category</Text>
        <Button

          disabled={!Boolean(amount) || totalCategoriesSum >= amount || submitting}
          type="button"
          variant="primary"
          onClick={onAddCategory}
        >
          + Add Category
        </Button>
      </div>
      <div className="flex flex-col gap-5">
        {category &&
          Object.entries(category).map(([key, value], index) => {
            return (
              <Fragment key={key}>
                <div className="flex items-center gap-4 justify-between">
                  <Select
                    disabled={submitting}
                    onValueChange={(value) => {
                      const res = { ...category };
                      const valueOfKey = res[key];
                      delete res[key];
                      res[value] = valueOfKey;

                      form.mutators.setFieldValue(`categories`, res);
                    }}
                    value={categories.find((c) => c.key === key)?.key}
                  >
                    {categories.map((category) => {
                      const CIcon = () => <CategoryIcon category={category} />;
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

                  <TextInput
                    disabled={submitting}
                    placeholder="Enter Amount"
                    value={value === 0 ? '' : value.toString()}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        form.mutators.setFieldValue(`categories.${key}`, 0);
                        return;
                      }
                      if (!regex.number.test(e.target.value)) {
                        return;
                      }
                      form.mutators.setFieldValue(
                        `categories.${key}`,
                        e.target.value === "" ? "" : parseInt(e.target.value)
                      );
                    }}
                  />
                  <DeleteButton
                    disabled={submitting}
                    onClick={() => {
                      const res = { ...category };
                      delete res[key];
                      form.mutators.setFieldValue("categories", res);
                    }} />
                </div>

                {category[key] > amount && (
                  <p className="text-xs text-red-500 text-right">
                    {capitalize(key)} cannot be more than total spending limit
                  </p>
                )}
              </Fragment>
            );
          })}
        {totalCategoriesSum > amount ? <p className="text-xs text-rose-500">The total sum of category amounts exceeds your spending limit.</p> : null}

        <Button disabled={amount === totalCategoriesSum} onClick={() => {
          const remainingAmount = amount - totalCategoriesSum;
          let sum = remainingAmount;
          if (category['other']) {
            sum = remainingAmount + category['other']
          }
          form.mutators.setFieldValue(
            `categories.other`,
            sum
          );
        }} type="button" variant="secondary">
          {amount < totalCategoriesSum ? `Adjust remaing amount in 'other' category` : `Add remaing amount in 'other' category`}
        </Button>
        <Flex>
          <Text>Total</Text>
          <Text>{totalCategoriesSum}</Text>
        </Flex>
      </div>
    </div>
  );
};

export default SpendingLimitPerCategory;
