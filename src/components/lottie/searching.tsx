import { Metric, Subtitle, Title } from '@tremor/react';
import animationData from 'expensasaures/lottie/searching.json';
import { defaultOptions } from "expensasaures/shared/utils/lottie";
import { useEffect, useState } from 'react';
import Lottie from "react-lottie";

interface Props {
    title?: string;
    description?: string;
    subtitle?: string;
}

const Searching = (props: Props) => {
    const { description, title, subtitle } = props;
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setVisible(true)
        }, 500)
        return () => clearTimeout(timeout)
    }, [])
    return (
        <div>
            <Lottie options={defaultOptions(animationData)}
                height={'auto'}
                width={400}
            />
            <div className='flex flex-col justify-center items-center'>
                {title && <Metric className='font-thin text-slate-500 mb-2'>{title}</Metric>}
                {/* {visible && subtitle && <Subtitle className='w-[60%] mb-3 text-center'>{subtitle}</Subtitle>} */}
                {subtitle && <Subtitle className='w-[60%] mb-3 text-center'>{subtitle}</Subtitle>}
                {/* {visible && description && <Title className='max-w-[60%] text-center'>{description}</Title>} */}
                {description && <Title className='max-w-[60%] text-slate-500 text-center'>{description}</Title>}
            </div>
        </div>
    )
}

export default Searching