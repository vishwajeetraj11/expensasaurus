import * as Popover from "@radix-ui/react-popover";
import { Button } from "@tremor/react";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { clsx } from "expensasaurus/shared/utils/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { Logo } from "./icons/svg";

interface Props {
  landingPage?: boolean;
}

const Navigation = (props: Props) => {
  const { landingPage = false } = props;
  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.classList.toggle("overflow-hidden", hamburgerMenuIsOpen);
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);

    window.addEventListener("orientationchange", closeHamburgerNavigation);
    window.addEventListener("resize", closeHamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation);
      window.removeEventListener("resize", closeHamburgerNavigation);
    };
  }, []);

  const { userInfo, getUserInfo, user, logout } = useAuthStore(
    (state) => ({
      user: state.user,
      userInfo: state.userInfo,
      getUserInfo: state.getUserInfo,
      logout: state.logout,
    }),
    shallow
  );

  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUserInfo();
    }
  }, [user]);

  return (
    <header className="fixed top-0 left-0 z-[12] w-full border-transparent-white backdrop-blur-[12px]">
      <div className="max-w-[1200px] mx-auto lg:px-0 px-8 flex h-navigation-height items-center">
        <Link
          href={landingPage ? "/" : "/dashboard"}
          className="flex items-center text-md"
        >
          <Logo
            className={clsx(
              "w-[1.8rem] h-[1.8rem] mr-4",
              !landingPage && "dark:fill-white"
            )}
          />
          <p className={clsx("text-[14px]", "dark:text-white")}>
            Expensasaurus
          </p>
        </Link>
        <div
          className={clsx(
            "transition-[visibility] md:visible ml-auto",
            hamburgerMenuIsOpen ? "visible" : "invisible delay-500"
          )}
        >
          <nav
            className={clsx(
              "md:opacity-100 h-[calc(100vh_-_var(--navigation-height))] md:block w-full fixed md:relative top-navigation-height md:top-0 left-0 overflow-auto bg-white  md:h-auto md:w-auto md:bg-transparent transform transition-[opacity] duration-500 md:translate-x-0",
              hamburgerMenuIsOpen ? "opacity-100" : "opacity-0",
              !landingPage && "dark:bg-black sm:dark:bg-transparent"
            )}
          >
            <ul
              className={clsx(
                "ease-in flex flex-col md:flex-row md:items-center h-full md:text-sm",
                "[&_a]:text-md md:[&_a]:transition-colors [&_li]:ml-6 [&_li]:border-bottom [&_li]:border-b [&_li]:border-grey-dark md:[&_li]:border-none",
                "[&_a]:h-navigation-height [&_a]:w-full [&_a]:flex [&_a]:items-center",
                !landingPage &&
                  " dark:[&_a:hover]:text-gray-200 dark:text-slate-200",
                hamburgerMenuIsOpen ? "[&_a]:!translate-y-0" : "", // not working
                "[&_a]:duration-300 [&_a]:translate-y-8 md:[&_a]:translate-y-0 [&_a]:transition-[color,transform]"
              )}
            >
              {!landingPage && (
                <>
                  <li>
                    <Link className="text-gray" href="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/assistant">Assistant</Link>
                  </li>
                  <li>
                    <Link href="/community">Community</Link>
                  </li>
                  <li>
                    <Link href="/expenses">Expense</Link>
                  </li>
                  <li className="">
                    <Link href="/incomes">Incomes</Link>
                  </li>
                  <li className="">
                    <Link href="/category">Category</Link>
                  </li>
                  <li className="">
                    <Link href="/calender">Calender</Link>
                  </li>
                  <li>
                    <Link href="/budgets">Budget</Link>
                  </li>
                </>
              )}

              {landingPage && (
                <>
                  <li className="">
                    <Link
                      onClick={() => setHamburgerMenuIsOpen((open) => false)}
                      href="#how-it-works"
                    >
                      How It Works
                    </Link>
                  </li>

                  <li className="">
                    <Link
                      onClick={() => setHamburgerMenuIsOpen((open) => false)}
                      href="#budget"
                    >
                      Budget Management
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {userInfo && (
          <>
            <Popover.Root>
              <Popover.Trigger asChild>
                <div className="ml-4 cursor-pointer w-8 h-8 border-gray-200 border rounded-full text-xs flex items-center justify-center bg-blue-500 text-white">
                  {userInfo?.name[0]}
                </div>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className={clsx(
                    "z-[9999] rounded p-5 w-[150px] bg-white shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade",
                    !!landingPage && "dark:bg-slate-500"
                  )}
                  sideOffset={5}
                >
                  <div className="flex flex-col gap-2.5">
                    <button type="button" className="text-base">
                      <Link href={"/dashboard"} className="text-base">
                        Dashboard
                      </Link>
                    </button>
                    <button type="button">
                      <Link href={"/profile"} className="text-base">
                        Profile
                      </Link>
                    </button>
                    <button
                      type="button"
                      onClick={() => logout(router)}
                      className="text-base"
                    >
                      Logout
                    </button>
                  </div>
                  <Popover.Arrow className="fill-white" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </>
        )}
        {landingPage && !userInfo && (
          <div className="flex h-full items-center  ml-auto">
            <Link href="/login" className="mr-6 text-sm">
              Log in
            </Link>
            <Link href="/signup" className="text-sm">
              <Button className="bg-blue-600" variant={"primary"}>
                Sign up
              </Button>
            </Link>
          </div>
        )}

        <button
          className="ml-6 md:hidden"
          onClick={() => setHamburgerMenuIsOpen((open) => !open)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            className="dark:text-white"
            width="18"
            height="11"
            viewBox="0 0 18 11"
            fill="none"
          >
            <path d="M0 0H18V1H0V0Z" fill="currentColor"></path>
            <path d="M0 10H18V11H0V10Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navigation;
