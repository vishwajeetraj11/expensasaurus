import {
  Button,
  Flex,
  SelectBox,
  SelectBoxItem,
  Text,
  TextInput,
} from "@tremor/react";
import { categories } from "expensasaures/shared/constants/categories";
import { regex } from "expensasaures/shared/constants/constants";
import { capitalize } from "expensasaures/shared/utils/common";
import { useField, useForm } from "react-final-form";
import CategoryIcon from "../forms/CategorySelect";

const SpendingLimitPerCategory = () => {
  const form = useForm();
  const formState = form.getState();
  const { input, meta } = useField("category");
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
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <Text>Category</Text>
        <Button
          disabled={!Boolean(amount) || totalCategoriesSum >= amount}
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
              <>
                <div className="flex items-center gap-4 justify-between">
                  <SelectBox
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
                        <SelectBoxItem
                          key={category.id}
                          value={category.key}
                          text={category.category}
                          icon={CIcon}
                        />
                      );
                    })}
                  </SelectBox>

                  <TextInput
                    value={value.toString()}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        form.mutators.setFieldValue(`categories.${key}`, "");
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
                </div>
                {category[key] > amount && (
                  <p className="text-xs text-red-500 text-right">
                    {capitalize(key)} cannot be more than total spending limit
                  </p>
                )}
              </>
            );
          })}
        <Flex>
          <Text>Total</Text>
          <Text>{totalCategoriesSum}</Text>
        </Flex>
      </div>
    </div>
  );
};

export default SpendingLimitPerCategory;
