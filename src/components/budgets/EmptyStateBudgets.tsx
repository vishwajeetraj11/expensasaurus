import { useMediaQuery } from "@mui/material";
import { Button, Metric, Subtitle } from "@tremor/react";
import animationData from 'expensasaurus/lottie/piggyBank.json';
import { noBudgetsCreated } from "expensasaurus/shared/constants/emptyState";
import { defaultOptions } from "expensasaurus/shared/utils/lottie";
import Link from "next/link";
import Lottie from 'expensasaurus/components/ui/Lottie';


const EmptyStateBudgets = () => {
    const isMobile = useMediaQuery('(max-width: 600px)');
    return (
        <div className="bg-slate-100 flex gap-10 flex-col-reverse md:flex-row items-center p-6 min-h-[400px] rounded-md">
            <div className="ml-0 md:ml-10 flex flex-col items-center md:items-start">
                <Metric className="text-center md:text-left text-slate-600 font-thin">{noBudgetsCreated.title}</Metric>
                <Subtitle className="text-center md:text-left mt-3 mb-4 max-w-[280px] font-medium text-slate-500">{noBudgetsCreated.description}</Subtitle>
                <Link shallow prefetch={false} href={noBudgetsCreated.buttonLink}>
                    <Button>+ {noBudgetsCreated.buttonText}</Button>
                </Link>
            </div>
            <Lottie options={defaultOptions(animationData)}
                width={'auto'}
                height={isMobile ? 'auto' : '400px'}
            />
        </div>
    )
}

export default EmptyStateBudgets