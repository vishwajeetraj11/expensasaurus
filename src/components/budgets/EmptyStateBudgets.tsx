import { Button, Metric, Subtitle } from "@tremor/react";
import animationData from 'expensasaures/lottie/piggyBank.json';
import { noBudgetsCreated } from "expensasaures/shared/constants/emptyState";
import { defaultOptions } from "expensasaures/shared/utils/lottie";
import Link from "next/link";
import Lottie from 'react-lottie';


const EmptyStateBudgets = () => {
    return (
        <div className="bg-slate-100 flex items-center p-6 min-h-[400px] rounded-md">
            <div className="ml-10 flex flex-col">
                <Metric className="text-slate-600 font-thin">{noBudgetsCreated.title}</Metric>
                <Subtitle className="mt-3 mb-4 max-w-[280px] font-medium text-slate-500">{noBudgetsCreated.description}</Subtitle>
                <Link shallow prefetch={false} href={noBudgetsCreated.buttonLink}>
                    <Button>+ {noBudgetsCreated.buttonText}</Button>
                </Link>
            </div>
            <Lottie options={defaultOptions(animationData)}
                height={400}
                width={'auto'}
            />
        </div>
    )
}

export default EmptyStateBudgets