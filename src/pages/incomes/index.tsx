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
import ExpenseTable from "expensasaures/components/ExpenseTable";
import CategoryIcon from "expensasaures/components/forms/CategorySelect";
import Layout from "expensasaures/components/layout/Layout";
import LeftSidebar from "expensasaures/components/ui/LeftSidebar";
import emptyDocsAnimation from "expensasaures/lottie/emptyDocs.json";
import animationData from "expensasaures/lottie/searchingDocs.json";
import {
    categoryNames,
    incomeCategories
} from "expensasaures/shared/constants/categories";
import { ENVS, regex } from "expensasaures/shared/constants/constants";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { capitalize } from "expensasaures/shared/utils/common";
import { defaultOptions } from "expensasaures/shared/utils/lottie";
import { getQueryForExpenses } from "expensasaures/shared/utils/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Lottie from "react-lottie";
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
        return <><div className="flex items-center justify-between">
            <Button onClick={onFilter}>Filter</Button>
            <Button variant="light" onClick={onClearFilters}>
                <XCircleIcon className="w-5 h-5" />
            </Button>
        </div>
            <Text className="my-2">Date</Text>
            <DateRangePicker
                disabled={disableFilters}
                className="max-w-md mx-auto"
                value={dates}
                onValueChange={(value) => {
                    setDates(value);
                }}
            />
            <div className="mt-4">
                <Text className="my-2">Search</Text>
                <TextInput
                    id="search-filter-income"
                    disabled={disableFilters}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                    }}

                />
            </div>
            <div className="mt-4">
                <Text className="my-2">Min Amount</Text>
                <TextInput
                    id="min-amount-income"
                    disabled={disableFilters}

                    value={minAmount === '0' ? '' : minAmount}
                    onChange={(e) => {
                        if (e.target.value === '') {
                            setMinAmount('0')
                        }
                        if (!regex.number.test(e.target.value)) {
                            return;
                        }
                        setMinAmount(e.target.value)

                    }}

                />
            </div>
            <div className="mt-4">
                <Text className="my-2">Max Amount</Text>
                <TextInput
                    id="max-amount-filter"
                    disabled={disableFilters}
                    value={maxAmount === '0' ? '' : maxAmount}
                    onChange={(e) => {
                        if (e.target.value === '') {
                            setMaxAmount('0')
                        }
                        if (!regex.number.test(e.target.value)) {
                            return;
                        }
                        setMaxAmount(e.target.value)
                    }}

                />
            </div>
            <div className="mt-4">
                <Text className="my-2">Category</Text>
                <Select
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
                <Text className="my-2">Tag</Text>
                <TextInput
                    disabled={disableFilters}
                    defaultValue={tag}
                    onChange={(e) => {
                        setTag(e.target.value)
                    }}
                />
            </div>
        </>
    }, [category, dates, disableFilters, maxAmount, minAmount, onFilter, query, tag])

    return (
        <Layout>
            <div className="flex flex-col flex-1 w-full max-w-[1200px] mx-auto px-4">
                <div className="flex items-center justify-between">
                    <button className="visible opacity-100 lg:invisible lg:opacity-0 cursor-pointer w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center" onClick={() => setIsOpen(true)}>
                        <FilterIcon className="w-4 h-4 text-white" />
                    </button>
                    <Title className="text-center py-10">Incomes</Title>
                    <Link href={"/incomes/create"}>
                        <Button>Add Income</Button>
                    </Link>
                </div>
                <div className="flex gap-8 flex-1">
                    <LeftSidebar showMenu={isOpen} onCloseMenu={() => { setIsOpen(false) }}>
                        {filterElements}
                    </LeftSidebar>
                    {/* <div className="hidden md:block md:w-[30%] pl-3">


                    </div> */}
                    <div className="w-full md:w-[70%] flex flex-1 flex-col">
                        {isLoading ? <>
                            <div className="w-full">
                                <Lottie options={defaultOptions(animationData)}
                                    height={500}
                                    width={'auto'}
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
                                    <Subtitle className='text-slate-700 text-center ml-[-30px]'>No Incomes Listed</Subtitle>
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
