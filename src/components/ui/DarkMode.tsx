import { isBrowser } from "expensasaurus/shared/utils/common";
import React, { useEffect } from "react";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const DarkMode = (props: ButtonProps) => {
  const { ...rest } = props;
  const [darkmode, setDarkmode] = React.useState(
    isBrowser ? document.body.classList.contains("dark") : false
  );

  useEffect(() => {
    if (localStorage.getItem('dark') === 'true' && !darkmode) {
      setDarkmode(true);
      document.body.classList.add("dark");
    }
  }, [])

  return (
    <button
      className="border-px fixed bottom-[30px] right-[35px] !z-[99] flex h-[40px] w-[40px] items-center justify-center rounded-full border-[#6a53ff] bg-gradient-to-br from-blue-500 to-blue-600 p-0"
      onClick={() => {
        if (darkmode) {
          document.body.classList.remove("dark");
          setDarkmode(false);
          localStorage.setItem('dark', 'false')
        } else {
          document.body.classList.add("dark");
          setDarkmode(true);
          localStorage.setItem('dark', 'true')
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

export default DarkMode
