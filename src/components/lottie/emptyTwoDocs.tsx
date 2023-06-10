import { Metric, Subtitle, Title } from '@tremor/react';
import animationData from 'expensasaures/lottie/empty2docs.json';
import { defaultOptions } from "expensasaures/shared/utils/lottie";
import Lottie from "react-lottie";


interface Props {
    title?: string;
    description?: string;
    subtitle?: string;
}

const EmptyTwoDocs = (props: Props) => {
    const { description, title, subtitle } = props;

    return (
        <div>
            <Lottie options={defaultOptions(animationData)}
                height={'auto'}
                width={400}
            />
            <div className='flex flex-col justify-center items-center'>
                {title && <Metric className='font-thin mb-2'>{title}</Metric>}
                {subtitle && <Subtitle className='w-[60%] mb-3 text-center'>{subtitle}</Subtitle>}
                {description && <Title className='max-w-[60%] text-center'>{description}</Title>}
            </div>
        </div>
    )
}

export default EmptyTwoDocs
