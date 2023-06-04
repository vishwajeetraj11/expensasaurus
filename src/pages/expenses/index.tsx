import { XCircleIcon } from "@heroicons/react/outline";
import { PaginationState } from "@tanstack/react-table";
import {
  Button,
  DateRangePicker,
  DateRangePickerValue,
  SelectBox,
  SelectBoxItem,
  Text,
  TextInput,
  Title
} from "@tremor/react";
import { Models } from "appwrite";
import ExpenseTable from "expensasaures/components/ExpenseTable";
import CategoryIcon from "expensasaures/components/forms/CategorySelect";
import Layout from "expensasaures/components/layout/Layout";
import {
  categories,
  categoryNames,
} from "expensasaures/shared/constants/categories";
import { ENVS } from "expensasaures/shared/constants/constants";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { capitalize } from "expensasaures/shared/utils/common";
import { getQueryForExpenses } from "expensasaures/shared/utils/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";

const index = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };
  const params = new URLSearchParams(window.location.search);
  const categoryQuery = params.get("category");
  const validQuery = categoryQuery
    ? categoryNames
      .find((c) => c === capitalize(categoryQuery as string))
      ?.toLowerCase()
    : false;

  const [dates, setDates] = useState<DateRangePickerValue>([]);
  const [query, setQuery] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [category, setCategory] = useState(validQuery || "");
  const [tag, setTag] = useState("");

  const [pagination, setPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })
  const fetchDataOptions = pagination


  const { data } = getAllLists<Transaction>(
    [
      "Expenses",
      user?.userId,
      dates,
      query,
      maxAmount,
      minAmount,
      category,
      tag,
      fetchDataOptions
    ],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.EXPENSES,
      getQueryForExpenses({
        dates,
        limit: pagination.pageSize,
        orderByDesc: "date",
        user,
        query,
        minAmount,
        maxAmount,
        category,
        tag,
        fetchDataOptions
      }),
    ],
    { enabled: !!user, keepPreviousData: true }
  );

  useEffect(() => { }, []);

  const onClearFilters = () => {
    setDates([]);
    setMaxAmount("");
    setMinAmount("");
    setQuery("");
    setTag("");
    setCategory("");
  };

  return (
    <Layout>
      <div className="dark:bg-navy-900 flex flex-col flex-1 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          &nbsp;
          <Title className="text-center py-10">Expenses</Title>
          <Link href={"/expenses/create"}>
            <Button>Add Expense</Button>
          </Link>
        </div>
        <div className="flex gap-8 flex-1">
          <div className="w-[30%] pl-3">
            <div className="flex items-center justify-between">
              <Button>Filter</Button>
              <Button variant="light" onClick={onClearFilters}>
                <XCircleIcon className="w-5 h-5" />
              </Button>
            </div>
            <Text className="my-2">Date</Text>
            <DateRangePicker
              className="max-w-md mx-auto"
              value={dates}
              onValueChange={(value) => {
                setDates(value);
              }}
            />
            <div className="mt-4">
              <Text className="my-2">Search</Text>
              <TextInput
                defaultValue={query}
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    setQuery(e.currentTarget.value);
                  }
                }}
              />
            </div>
            <div className="mt-4">
              <Text className="my-2">Min Amount</Text>
              <TextInput
                defaultValue={minAmount}
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    setMinAmount(e.currentTarget.value);
                  }
                }}
              />
            </div>
            <div className="mt-4">
              <Text className="my-2">Max Amount</Text>
              <TextInput
                defaultValue={maxAmount}
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    setMaxAmount(e.currentTarget.value);
                  }
                }}
              />
            </div>
            <div className="mt-4">
              <Text className="my-2">Category</Text>
              <SelectBox
                value={category}
                onValueChange={(value) => setCategory(value)}
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
            </div>
            <div className="mt-4">
              <Text className="my-2">Tag</Text>
              <TextInput
                defaultValue={tag}
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    setTag(e.currentTarget.value);
                  }
                }}
              />
            </div>

          </div>
          <div className="w-[70%] flex flex-1 flex-col">
            {/* {data?.documents?.map((expense) => {
              return <ExpenseCalCard expense={expense} key={expense.$id} />;
            })} */}
            {data && <ExpenseTable setPagination={setPagination} pageCount={Math.ceil(data?.total / pagination.pageSize)} fetchDataOptions={fetchDataOptions} data={data?.documents || []} />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(async () => index, { ssr: false });
