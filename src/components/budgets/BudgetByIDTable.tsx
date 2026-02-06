import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title
} from "@tremor/react";
import { GrInProgress } from "react-icons/gr";
import { MdTrackChanges } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";

interface Props {
    data: {
        [k: string]: {
            budget: number;
            currency: string;
            amount: number;
            transactionsCount: number;
            budgetPercent: number;
        };
    }
}

const BudgetAnalysisTable = (props: Props) => {
    const { data } = props;
    return (
        <>

            <div className="mt-10">
                <Title className="text-slate-900 dark:text-slate-100">Budget Analysis</Title>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)]">
                    <Table className="w-full text-sm">
                        <TableHead className="bg-white dark:bg-slate-900/80">
                            <TableRow className="border-b border-slate-200 dark:border-white/10">
                                <TableHeaderCell className="pl-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Category</TableHeaderCell>
                                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Budget</TableHeaderCell>
                                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Spending</TableHeaderCell>
                                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Status</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-slate-200/70 dark:divide-white/10">
                        {Object.entries(data).filter(([category, value]) => value.budget !== 0 || value.amount !== 0).map(([key, value], index) => {
                            const status = value.budget === 0
                                ? {
                                    label: "Not Set",
                                    Icon: MdTrackChanges,
                                    classes:
                                        "bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
                                }
                                : value.amount > value.budget
                                ? {
                                    label: "Exceeded",
                                    Icon: RxCrossCircled,
                                    classes:
                                        "bg-rose-100 text-rose-800 ring-rose-300 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
                                }
                                : {
                                    label: "On Track",
                                    Icon: GrInProgress,
                                    classes:
                                        "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
                                };
                            return (
                                <TableRow key={index} className="transition hover:bg-slate-50/60 dark:hover:bg-white/5">
                                    <TableCell className="pl-6 capitalize text-slate-700 dark:text-slate-100">{key}</TableCell>
                                    <TableCell>
                                        <Text className="text-slate-600 dark:text-slate-300">{value.budget}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Text className="text-slate-600 dark:text-slate-300">
                                            {value.amount}
                                        </Text>
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.classes}`}
                                        >
                                            <status.Icon className="h-3.5 w-3.5" />
                                            {status.label}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                </div>
            </div >



        </>
    )
};

export default BudgetAnalysisTable
