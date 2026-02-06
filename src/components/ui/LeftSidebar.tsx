import { useClickOutside } from "expensasaurus/hooks/useClickOutside";
import { clsx } from "expensasaurus/shared/utils/common";
import { RefObject, useEffect, useRef } from "react";

interface Props {
  showMenu: boolean;
  onCloseMenu?: () => void;
  children: React.ReactNode;
}

const LeftSidebar = (props: Props) => {
  const { showMenu, onCloseMenu, children } = props;
  const ref = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>;
  let classes = clsx(
    "absolute inset-y-0 left-0 z-30 flex w-[290px] flex-shrink-0 transform flex-col justify-items-start overflow-y-auto rounded-r-2xl border-r border-slate-200/70 bg-white/95 px-4 pb-6 pt-[96px] text-sm text-slate-700 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.7)] backdrop-blur-xl duration-300 dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-200 lg:static lg:z-auto lg:w-[300px] lg:translate-x-0 lg:rounded-2xl lg:border lg:border-slate-200/70 lg:bg-white/80 lg:px-4 lg:pb-5 lg:pt-4 lg:shadow-[0_12px_35px_-25px_rgba(15,23,42,0.65)] dark:lg:border-white/10 dark:lg:bg-slate-900/70",
    !showMenu && "-translate-x-full ease-out shadow-none",
    showMenu && "translate-x-0 ease-in shadow-xl"
  );
  let ready = false;
  useClickOutside(ref, () => {
    if (ready && showMenu && onCloseMenu) onCloseMenu();
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => (ready = true), 300);
  });

  return (
    <div className={classes} style={{ zIndex: 2 }} ref={ref}>
      {children}
    </div>
  );
};

export default LeftSidebar;
