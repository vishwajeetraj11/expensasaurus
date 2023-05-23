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
import { useField, useForm } from "react-final-form";

const SpendingLimitPerCategory = () => {
  const form = useForm();
  const formState = form.getState();
  const { input, meta } = useField("category");
  const category = formState.values.categories as Record<string, number>;
  const onAddCategory = () => {
    if (category["category"]) {
      return;
    }
    const res = { ...category };
    res["category"] = 0;
    form.mutators.setFieldValue("categories", res);
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <Text>Category</Text>
        <Button type="button" variant="primary" onClick={onAddCategory}>
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
                    value={categories
                      .find((c) => c.category.toLowerCase() === key)
                      ?.category.toLowerCase()}
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
              </>
            );
          })}
        <Flex>
          <Text>Total</Text>
          <Text>
            {Object.entries(category)
              .map(([_, value]) => value)
              .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
              )}
          </Text>
        </Flex>
      </div>
    </div>
  );
};

export default SpendingLimitPerCategory;

/*
  <SelectBox
        onValueChange={(value) => input.onChange(value as string)}
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
*/
