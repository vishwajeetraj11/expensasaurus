import { isBrowser } from "expensasaures/shared/utils/common";
import React from "react";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function DarkMode(props: ButtonProps) {
  const { ...rest } = props;
  const [darkmode, setDarkmode] = React.useState(
    isBrowser ? document.body.classList.contains("dark") : false
  );

  return (
    <button
      className="border-px fixed bottom-[30px] right-[35px] !z-[99] flex h-[60px] w-[60px] items-center justify-center rounded-full border-[#6a53ff] bg-gradient-to-br from-brandLinear to-blueSecondary p-0"
      onClick={() => {
        if (darkmode) {
          document.body.classList.remove("dark");
          setDarkmode(false);
        } else {
          document.body.classList.add("dark");
          setDarkmode(true);
        }
      }}
      {...rest}
    >
      {/* // left={document.documentElement.dir === "rtl" ? "35px" : ""}
      // right={document.documentElement.dir === "rtl" ? "" : "35px"} */}
      <div className="cursor-pointer text-gray-600">
        {darkmode ? (
          <RiSunFill className="h-4 w-4 text-white" />
        ) : (
          <RiMoonFill className="h-4 w-4 text-white" />
        )}
      </div>
    </button>
  );
}
