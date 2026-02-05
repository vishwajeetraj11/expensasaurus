import React from "react";
import LottiePlayer from "lottie-react";

type LottieOptions = {
  loop?: boolean;
  autoplay?: boolean;
  animationData: object;
  rendererSettings?: Record<string, unknown>;
};

interface LottieProps {
  options: LottieOptions;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const Lottie = ({ options, height, width, className, style }: LottieProps) => {
  const mergedStyle: React.CSSProperties = { ...style };

  if (height !== undefined) {
    mergedStyle.height = height;
  }

  if (width !== undefined) {
    mergedStyle.width = width;
  }

  return (
    <LottiePlayer
      animationData={options.animationData}
      loop={options.loop}
      autoplay={options.autoplay}
      rendererSettings={options.rendererSettings}
      className={className}
      style={mergedStyle}
    />
  );
};

export default Lottie;
