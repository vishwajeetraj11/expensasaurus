import { FilterIcon, XCircleIcon } from "@heroicons/react/outline";
import { PaginationState } from "@tanstack/react-table";
import {
    Button,
    DateRangePicker,
    DateRangePickerValue,
    Select,
    SelectItem,
    Subtitle,
    Text,
    TextInput,
    Title
} from "@tremor/react";
import { Models } from "appwrite";
import ExpenseTable from "expensasaurus/components/ExpenseTable";
import CategoryIcon from "expensasaurus/components/forms/CategorySelect";
import Layout from "expensasaurus/components/layout/Layout";
import LeftSidebar from "expensasaurus/components/ui/LeftSidebar";
import emptyDocsAnimation from "expensasaurus/lottie/emptyDocs.json";
import animationData from "expensasaurus/lottie/searchingDocs.json";
import {
    categoryNames,
    incomeCategories
} from "expensasaurus/shared/constants/categories";
import { ENVS, regex } from "expensasaurus/shared/constants/constants";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { getAllLists } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { capitalize } from "expensasaurus/shared/utils/common";
import { defaultOptions } from "expensasaurus/shared/utils/lottie";
import { getQueryForExpenses } from "expensasaurus/shared/utils/react-query";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Lottie from "expensasaurus/components/ui/Lottie";
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

    const [dates, setDates] = useState<DateRangePickerValue>({});
    const [query, setQuery] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [category, setCategory] = useState(validQuery || "");
    const [tag, setTag] = useState("");

    const [filter, setFilters] = useState<any[]>([])

    const [pagination, setPagination] =
        useState<PaginationState>({
            pageIndex: 0,
            pageSize: 10,
        })
    const fetchDataOptions = pagination
    const loaderSize = 260;


    const { data, isLoading, isFetching } = getAllLists<Transaction>(
        [
            "Incomes", "Listing",
            user?.userId,
            ...filter,
            fetchDataOptions
        ],
        [
            ENVS.DB_ID,
            ENVS.COLLECTIONS.INCOMES,
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
        { enabled: !!user, keepPreviousData: true, staleTime: 2000, cacheTime: 2000 }
    );

    const [isOpen, setIsOpen] = useState(false)

    const onClearFilters = () => {
        setDates({});
        setMaxAmount("");
        setMinAmount("");
        setQuery("");
        setTag("");
        setCategory("");
        setFilters([])
        setIsOpen(false)
    };

    const onFilter = useCallback(() => {
        setFilters([
            dates,
            query,
            maxAmount,
            minAmount,
            category,
            tag
        ])
        setIsOpen(false)
    }, [category, dates, maxAmount, minAmount, query, tag])

    const disableFilters = isLoading || isFetching

    const filterElements = useMemo(() => {
        return (
            <>
                <div className="mb-2 flex items-center justify-between gap-2">
                    <Button onClick={onFilter}>Apply</Button>
                    <Button variant="light" onClick={onClearFilters}>
                        <XCircleIcon className="h-5 w-5" />
                    </Button>
                </div>
                <Text className="my-2 font-medium text-slate-600 dark:text-slate-300">
                    Date
                </Text>
                <DateRangePicker
                    disabled={disableFilters}
                    className="w-full"
                    value={dates}
                    onValueChange={(value) => {
                        setDates(value);
                    }}
                />
                <div className="mt-4">
                    <Text className="my-2 font-medium text-slate-600 dark:text-slate-300">
                        Search
                    </Text>
                    <TextInput
                        className="w-full"
                        id="search-filter-income"
                        disabled={disableFilters}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                    />
                </div>
                <div className="mt-4">
                    <Text className="my-2 font-medium text-slate-600 dark:text-slate-300">
                        Min Amount
                    </Text>
                    <TextInput
                        className="w-full"
                        id="min-amount-income"
                        disabled={disableFilters}
                        value={minAmount === "0" ? "" : minAmount}
                        onChange={(e) => {
                            if (e.target.value === "") {
                                setMinAmount("0");
                            }
                            if (!regex.number.test(e.target.value)) {
                                return;
                            }
                            setMinAmount(e.target.value);
                        }}
                    />
                </div>
                <div className="mt-4">
                    <Text className="my-2 font-medium text-slate-600 dark:text-slate-300">
                        Max Amount
                    </Text>
                    <TextInput
                        className="w-full"
                        id="max-amount-filter"
                        disabled={disableFilters}
                        value={maxAmount === "0" ? "" : maxAmount}
                        onChange={(e) => {
                            if (e.target.value === "") {
                                setMaxAmount("0");
                            }
                            if (!regex.number.test(e.target.value)) {
                                return;
                            }
                            setMaxAmount(e.target.value);
                        }}
                    />
                </div>
                <div className="mt-4">
                    <Text className="my-2 font-medium text-slate-600 dark:text-slate-300">
                        Category
                    </Text>
                    <Select
                        className="w-full"
                        disabled={disableFilters}
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                    >
                        {incomeCategories.map((category) => {
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
                </div>
                <div className="mt-4">
                    <Text className="my-2 font-medium text-slate-600 dark:text-slate-300">
                        Tag
                    </Text>
                    <TextInput
                        className="w-full"
                        disabled={disableFilters}
                        defaultValue={tag}
                        onChange={(e) => {
                            setTag(e.target.value);
                        }}
                    />
                </div>
            </>
        );
    }, [category, dates, disableFilters, maxAmount, minAmount, onFilter, query, tag])

    return (
        <Layout>
            <Head>
                <title>Expensasaurus - Track and Sort Your Incomes</title>
            </Head>
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 pt-16">
                <div className="flex items-center justify-between">
                    <button className="visible opacity-100 lg:invisible lg:opacity-0 cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500 shadow-sm transition hover:bg-blue-400" onClick={() => setIsOpen(true)}>
                        <FilterIcon className="w-4 h-4 text-white" />
                    </button>
                    <Title className="py-10 text-center text-slate-900 dark:text-slate-100">Incomes</Title>
                    <Link href={ROUTES.INCOME_CREATE}>
                        <Button>Add Income</Button>
                    </Link>
                </div>
                <div className="flex gap-8 flex-1">
                    <LeftSidebar showMenu={isOpen} onCloseMenu={() => { setIsOpen(false) }}>
                        {filterElements}
                    </LeftSidebar>
                    {/* <div className="hidden md:block md:w-[30%] pl-3">


                    </div> */}
                    <div className="flex w-full flex-1 flex-col md:w-[70%]">
                        {isLoading ? <>
                            <div className="mx-auto w-full max-w-[260px]">
                                <Lottie options={defaultOptions(animationData)}
                                    height={loaderSize}
                                    width={loaderSize}
                                />
                            </div>
                        </> : data
                            ? data.documents?.length === 0
                                ?
                                <div className="w-full">
                                    <Lottie options={defaultOptions(emptyDocsAnimation)}
                                        height={500}
                                        width={'auto'}
                                    />
                                    <Subtitle className='ml-[-30px] text-center text-slate-700 dark:text-slate-300'>No Incomes Listed</Subtitle>
                                </div> : (
                                    <ExpenseTable
                                        type="income"
                                        setPagination={setPagination}
                                        pageCount={Math.ceil(data?.total / pagination.pageSize)}
                                        fetchDataOptions={fetchDataOptions}
                                        data={data?.documents || []}
                                    />
                                ) : null}

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default dynamic(async () => index, { ssr: false });
