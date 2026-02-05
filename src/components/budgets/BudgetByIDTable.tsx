import {
    Badge,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title
} from "@tremor/react";
import clsx from "clsx";
import { GrInProgress } from "react-icons/gr";
import { MdTrackChanges } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";


const budgetStatus = {
    onTrack: {
        title: "On Track",
        icon: MdTrackChanges,
    },
    warning: "Warning",
    exceeded: "Exceeded",
    notSet: "Not Set",
    completed: "Completed",
}



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
                <Title>Budget Analysis</Title>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.15)]">
                    <Table className="w-full text-sm">
                        <TableHead className="bg-white">
                            <TableRow className="border-b border-slate-200">
                                <TableHeaderCell className="pl-6 py-4 text-sm font-semibold text-slate-700">Category</TableHeaderCell>
                                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700">Budget</TableHeaderCell>
                                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700">Spending</TableHeaderCell>
                                <TableHeaderCell className="py-4 text-sm font-semibold text-slate-700">Status</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-slate-200/70">
                        {Object.entries(data).filter(([category, value]) => value.budget !== 0 || value.amount !== 0).map(([key, value], index) => {
                            const sadLilDevVariable = index === Object.entries(data).length - 1;
                            const lastElemClasses = clsx(sadLilDevVariable ? 'font-bold text-slate-700' : '');
                            const firstRowClasses = clsx('pl-6');
                            return (
                                <TableRow key={index} className="transition hover:bg-slate-50/60">
                                    <TableCell className={clsx(lastElemClasses, firstRowClasses, 'capitalize')}>{key}</TableCell>
                                    <TableCell>
                                        <Text className={clsx(lastElemClasses)}>{value.budget}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Text className={clsx(lastElemClasses)}>
                                            {value.amount}
                                        </Text>
                                    </TableCell>

                                    <TableCell>
                                        <Badge color={value.budget === 0 ? 'yellow' : value.amount > value.budget ? "red" : 'emerald'} icon={value.budget === 0 ? MdTrackChanges : value.amount > value.budget ? RxCrossCircled : GrInProgress}>
                                            {value.budget === 0 ? 'Not Set' : value.amount > value.budget ? 'Exceeded' : 'On Track'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {/* <TableRow>
                                    <TableCell className={clsx(lastElemClasses, firstRowClasses)}>{key}</TableCell>
                                    <TableCell>
                                        <Text className={clsx(lastElemClasses)}>{value.budget}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Text className={clsx(lastElemClasses)}>{value.amount}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={value.budget === 0 ? 'yellow' : value.amount > value.budget ? "red" : 'emerald'} icon={value.budget === 0 ? MdTrackChanges : value.amount > value.budget ? RxCrossCircled : GrInProgress}>
                                            {value.budget === 0 ? 'Not Set' : value.amount > value.budget ? 'Exceeded' : 'On Track'}
                                        </Badge>
                                    </TableCell>
                                </TableRow> */}
                    </TableBody>
                </Table>
                </div>
            </div >



        </>
    )
};

export default BudgetAnalysisTable
