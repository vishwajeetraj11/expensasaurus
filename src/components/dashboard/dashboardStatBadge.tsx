
import { DeltaType } from '@tremor/react';
import { TransactionType } from 'expensasaures/shared/utils/calculation';
import { clsx } from 'expensasaures/shared/utils/common';
import { ArrowDownIcon, ArrowDownRightIcon, ArrowUpIcon, ArrowUpRightIcon } from '../svgs';


interface Props {
    deltaType: DeltaType;
    resource: TransactionType;
    change: number;
}

const DeltaIcon = ({ deltaType, resource, change }: Props) => {
    let IconComponent;
    let classes;
    const defaultClass = 'text-sm py-1 px-2.5 rounded-tremor-full justify-center items-center flex w-max inline-flex flex-shrink-0'
    const isExpense = resource === 'expense';

    switch (deltaType) {
        case 'increase':
            IconComponent = isExpense ? ArrowDownIcon : ArrowUpIcon;
            classes = 'bg-emerald-100 text-emerald-700';
            break;
        case 'moderateIncrease':
            IconComponent = isExpense ? ArrowDownRightIcon : ArrowUpRightIcon;
            classes = 'bg-emerald-100 text-emerald-700';
            break;
        case 'decrease':
            IconComponent = isExpense ? ArrowUpIcon : ArrowDownIcon;
            classes = 'bg-rose-100 text-rose-700';
            break;
        case 'moderateDecrease':
            IconComponent = isExpense ? ArrowUpRightIcon : ArrowDownRightIcon;
            classes = 'bg-rose-100 text-rose-700';
            break;
        case 'unchanged':
            IconComponent = ArrowDownRightIcon;
            classes = 'bg-rose-100 text-rose-700';
            break;
        default:
            IconComponent = null;
            classes = 'bg-slate-100 text-slate-700';
            break;
    }

    if (!IconComponent) {
        return null;
    }


    return (
        <div className={clsx(defaultClass, classes)}>
            <IconComponent className='w-4 h-4' />
        </div>
    );
};

export default DeltaIcon;
