"use client";

import classNames from "classnames";
import { useInView } from "react-intersection-observer";

type FeaturesProps = {
    children: React.ReactNode;
    color: string;
    colorDark: string;
};

export const Features = ({ children, color, colorDark }: FeaturesProps) => {
    const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: false });

    return (
        <section
            id="budget"
            ref={ref}
            className={classNames(
                "w-[100vw]",
                "after:bg-[radial-gradient(ellipse_100%_40%_at_50%_60%,rgba(var(--feature-color),0.1),transparent) relative flex flex-col items-center overflow-x-clip",
                "before:pointer-events-none before:absolute before:h-[400px] before:w-full",
                "before:bg-[conic-gradient(from_90deg_at_80%_50%,#f2f2f2,rgb(var(--feature-color-dark))),conic-gradient(from_270deg_at_20%_50%,rgb(var(--feature-color-dark)),#f2f2f2)]",
                "before:bg-no-repeat before:transition-[transform,opacity] before:duration-1000 before:ease-in before:[mask:radial-gradient(100%_50%_at_center_center,_black,_transparent)]",
                "before:[background-size:50%_100%,50%_100%] before:[background-position:1%_0%,99%_0%] after:pointer-events-none after:absolute after:inset-0",
                inView &&
                "is-visible before:opacity-100 before:[transform:rotate(180deg)_scale(2)]",
                !inView && "before:rotate-180 before:opacity-40"
            )}
            style={
                {
                    "--feature-color": color,
                    "--feature-color-dark": colorDark,
                } as React.CSSProperties
            }
        >
            <div className="mt-[128px] w-full md:mt-[252px]">
                {children}
            </div>
        </section>
    );
};

type MainFeatureProps = {
    image: string;
    text: string;
    title: React.ReactNode;
    imageSize?: "small" | "large";
};

const MainFeature = ({
    image,
    text,
    title,
    imageSize = "small",
}: MainFeatureProps) => {
    return (
        <>
            <div className="relative before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_50%_50%_at_center,rgba(var(--feature-color),0.1),transparent)]">
                <div
                    className={classNames(
                        "text-center mx-auto max-w-[1200px] px-8",
                        imageSize === "small" ? "lg:w-[780px]" : "lg:w-[1024px]"
                    )}
                >
                    <h2 className="text-white leading-[1.2] mb-11 translate-y-[40%] pt-[120px] text-center text-[32px] md:text-[72px] [transition:transform_1000ms_cubic-bezier(0.3,_1.17,_0.55,_0.99)_0s] md:pt-0 [.is-visible_&]:translate-y-0">
                        {title}
                    </h2>
                    <div className="relative z-10 rounded-[14px] backdrop-blur-[6px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(rgba(255,_255,_255,_0.3),_rgba(255,_255,_255,_0)_120%)] before:p-[1px] before:[mask:linear-gradient(black,_black)_content-box_content-box,_linear-gradient(black,_black)] before:[mask-composite:xor] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[rgba(255,_255,_255,_0.15)] after:[mask:linear-gradient(black,transparent)]">
                        <img src={image} className="h-auto w-full p-6 rounded-[10px]" />
                    </div>
                </div>
            </div>
            <div className="w-full mx-auto max-w-[87%] md:max-w-[78%] text-center">
                <p className="mx-auto my-16 text-[20px] md:text-[32px] leading-tight text-slate-600 md:w-[80%]">
                    {text}
                </p>
                <hr className="mb-[72px] h-[1px] border-none bg-[linear-gradient(to_right,transparent,#2152ff_50%,transparent)]" />
            </div>
        </>
    );
};

type FeatureGridProps = {
    features: {
        icon: React.FC;
        title: string;
        text: string;
    }[];
};

const FeatureGrid = ({ features }: FeatureGridProps) => {
    return (
        <div className="mx-auto max-w-[1200px] px-8">
            <div className="mb-16 grid w-full grid-cols-2 place-items-center gap-x-2 md:gap-x-0 gap-y-9 text-sm text-slate-700 md:mb-[140px] md:grid-cols-3 md:text-md">
                {features.map(({ title, text, icon: Icon }) => (
                    <div
                        className="max-w-[256px] text-slate-700 text-[14px] md:text-[16px] w-full [&_svg]:mb-[4px] [&_svg]:text-slate-800 md:[&_svg]:mr-[6px] md:[&_svg]:mb-[2px] md:[&_svg]:inline"
                        key={title}
                    >
                        <Icon />
                        <span className="block text-slate-800 font-medium md:inline">{title}</span> {text}
                    </div>
                ))}
            </div>
        </div>
    );
};


// type FeatureCardsProps = {
//     features: {
//         image: string;
//         imageClassName: string;
//         title: string;
//         text: string;
//     }[];
// };

// const FeatureCards = ({ features }: FeatureCardsProps) => {
//     return (
//         <div className="mx-auto max-w-[1200px] px-8">
//             <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
//                 {features.map(({ title, text, image, imageClassName }) => (
//                     <div
//                         key={title}
//                         className="relative aspect-[1.1/1] overflow-hidden rounded-[2.4rem] border border-transparent-white bg-[radial-gradient(ellipse_at_center,rgba(var(--feature-color),0.15),transparent)] py-6 px-8 before:pointer-events-none before:absolute before:inset-0 before:bg-glass-gradient md:rounded-[4.8rem] md:p-14"
//                     >
//                         <h3 className="mb-2 text-2xl text-slate-600">{title}</h3>
//                         <p className="max-w-[31rem] text-md text-primary-text">{text}</p>
//                         <img
//                             className={classNames("absolute max-w-none", imageClassName)}
//                             src={image}
//                         />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

Features.Main = MainFeature;
Features.Grid = FeatureGrid;
// Features.Cards = FeatureCards;
