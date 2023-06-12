import { Button, Flex, Metric, Subtitle, Title } from '@tremor/react';
import animationData from 'expensasaurus/lottie/pageNotFound.json';
import { defaultOptions } from "expensasaurus/shared/utils/lottie";
import Link from 'next/link';
import Lottie from "react-lottie";

interface Props {
    title?: string;
    description?: string;
    subtitle?: string;
}


const PageNotFoundLottie = (props: Props) => {
    const { description, title, subtitle } = props;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
            {title && <Metric className='font-thin mb-20 order-1'>{title}</Metric>}
            <div className='mb-20 h-[200px] md:w-auto md:h-[40vh] order-2'>
                <Lottie options={defaultOptions(animationData)}
                    width={'100%'}
                />
            </div>
            {subtitle && <Subtitle className='order-3 sm:w-[60%] mb-3 text-center text-slate-500'>{subtitle}</Subtitle>}
            {description && <Title className='order-4 sm:max-w-[60%] text-center font-normal'>{description}</Title>}
            <Flex className='order-5 max-w-[280px] mt-10'>
                <Link href={'/dashboard'}>
                    <Button color='slate' variant='primary'>Dashboard</Button>
                </Link>
                <Link href={'/dashboard'}>
                    <Button color='slate' variant='secondary'>Explore Expenses</Button>
                </Link>
            </Flex>
        </div>
    )
}

export default PageNotFoundLottie