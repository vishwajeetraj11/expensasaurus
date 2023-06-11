import { SVGProps } from "react";

interface SVGExtProps extends SVGProps<SVGSVGElement> {
    strokeColor?: string;
}


const ArrowDownIcon = ({ ...props }: SVGExtProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" {...props}>
        <path fill="none" d="M0 0h24v24H0z" />
        <path
            fill="currentColor"
            d="M13 16.172l5.364-5.364 1.414 1.414L12 20l-7.778-7.778 1.414-1.414L11 16.172V4h2v12.172z"
        />
    </svg>
);

const ArrowUpIcon = ({ ...props }: SVGExtProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" {...props}>
        <path fill="none" d="M0 0h24v24H0z" />
        <path
            fill="currentColor"
            d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z"
        />
    </svg>
);

const ArrowDownRightIcon = ({ ...props }: SVGExtProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" {...props}>
        <path fill="none" d="M0 0h24v24H0z" />
        <path
            fill="currentColor"
            d="M14.59 16.004L5.982 7.397l1.414-1.414 8.607 8.606V7.004h2v11h-11v-2z"
        />
    </svg>
);

const ArrowUpRightIcon = ({ ...props }: SVGExtProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" {...props}>
        <path fill="none" d="M0 0h24v24H0z" />
        <path
            fill="currentColor"
            d="M16.004 9.414l-8.607 8.607-1.414-1.414L14.589 8H7.004V6h11v11h-2V9.414z"
        />
    </svg>
);

export {
    ArrowDownIcon, ArrowDownRightIcon, ArrowUpIcon, ArrowUpRightIcon
};

