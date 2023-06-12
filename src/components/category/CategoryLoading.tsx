import { ChevronDownIcon } from "@heroicons/react/solid";
import {
    Flex,
    Subtitle,
    Text,
    Title
} from "@tremor/react";
import { LineChartTabsLoading } from "expensasaurus/components/dashboard/linechart";

const CategoryLoading = () => {
    return (
        <>
            <Title className="py-10 text-center">Category</Title>
            <Flex className="items-baseline mb-10">
                <Subtitle className="text-slate-600">Date Range</Subtitle>
                <div className="ml-auto">
                    <div className="h-[38px] w-[400px] flex items-center justify-center p-6 relative overflow-hidden rounded-md bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 dark:before:via-slate-50/10 before:to-transparent">
                        <div className="h-[15px] bg-slate-400/20 rounded-full w-[150px]">&nbsp;</div>
                        <ChevronDownIcon className="ml-auto text-slate-300 text-[12px] h-5 w-5" />
                    </div>
                </div>
            </Flex>

            <Text className="text-slate-600 mb-4">Expenses per category</Text>
            <div className="grid xl:grid-cols-4  lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (_, i) => (
                        <div key={_} className="h-[88px] p-6 w-full flex items-center relative overflow-hidden rounded-2xl bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 dark:before:via-slate-50/10 before:to-transparent">
                            <div className="w-10 h-10 rounded-full bg-slate-400/20 mr-3">&nbsp;</div>
                            <div className="">
                                <div className="h-[13px] bg-slate-400/20 rounded-full w-[60px] mb-2">&nbsp;</div>
                                <div className="h-[13px] bg-slate-400/20 rounded-full w-[70px]">&nbsp;</div>
                            </div>
                            <div className="h-[13px] bg-slate-500/20 rounded-full w-[50px] mb-2 ml-auto">&nbsp;</div>
                        </div>
                    )
                )}
            </div>

            <div className="flex justify-between items-center my-10">
                <Text className="text-slate-600">Category wise transactions</Text>
                <div className="h-[38px] w-[300px] flex items-center justify-center p-6 relative overflow-hidden rounded-md bg-white/10 shadow-xl shadow-black/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-100 before:bg-gradient-to-r before:from-transparent before:via-slate-50/50 dark:before:via-slate-50/10 before:to-transparent">
                    <div className="h-[15px] bg-slate-400/20 rounded-full w-[150px]">&nbsp;</div>
                    <ChevronDownIcon className="ml-auto text-slate-300 text-[12px] h-5 w-5" />
                </div>
            </div>
            <LineChartTabsLoading />
        </>
    );
}


export default CategoryLoading