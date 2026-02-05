import { Button, Metric, Subtitle, Title } from '@tremor/react';
import animationData from 'expensasaurus/lottie/emptyBox.json';
import { defaultOptions } from "expensasaurus/shared/utils/lottie";
import Link from 'next/link';
import Lottie from "expensasaurus/components/ui/Lottie";

interface Props {
    title?: string;
    description?: string;
    subtitle?: string;
    href?: string;
    onClick?: () => void;
    btnCTA?: string;
}

const NotFound = (props: Props) => {
    const { description, title, subtitle, btnCTA, href, onClick = () => { } } = props;

    return (
        <div className='mt-5 mb-5 sm:mt-20'>
            <Lottie options={defaultOptions(animationData)}
                height={'auto'}
                width={400}
            />
            <div className='flex flex-col justify-center items-center px-4'>
                {title && <Metric className='font-thin mb-3'>{title}</Metric>}
                {subtitle && <Subtitle className='sm:w-[60%] mb-5 text-center'>{subtitle}</Subtitle>}
                {description && <Title className='sm:max-w-[60%] text-center'>{description}</Title>}
                {href && <Link href={href}>
                    <Button onClick={onClick} color='slate' className='mt-5'>{btnCTA}</Button>
                </Link>}
            </div>
        </div>
    )
}

export default NotFound