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

            <div className="p-6 shadow-subtle mt-10 border-none">
                <Title>Budget Analysis</Title>
                <Table className="mt-5">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell className="pl-0">Category</TableHeaderCell>
                            <TableHeaderCell>Budget</TableHeaderCell>
                            <TableHeaderCell>Spending</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(data).filter(([category, value]) => value.budget !== 0 || value.amount !== 0).map(([key, value], index) => {
                            const sadLilDevVariable = index === Object.entries(data).length - 1;
                            const lastElemClasses = clsx(sadLilDevVariable ? 'font-bold text-slate-700' : '');
                            const firstRowClasses = clsx('pl-0');
                            return (
                                <TableRow key={index}>
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
            </div >



        </>
    )
};

export default BudgetAnalysisTable