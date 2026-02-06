import * as Popover from "@radix-ui/react-popover";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { isAssistantEmailAllowed } from "expensasaurus/shared/constants/assistantAccess";
import { LANDING_SECTIONS, ROUTES } from "expensasaurus/shared/constants/routes";
import { clsx } from "expensasaurus/shared/utils/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { shallow } from "zustand/shallow";
import { Logo } from "./icons/svg";

interface Props {
  landingPage?: boolean;
}

type NavItem = {
  href: string;
  label: string;
};

const landingLinks: NavItem[] = [
  { href: LANDING_SECTIONS.HOW_IT_WORKS, label: "How It Works" },
  { href: LANDING_SECTIONS.ASSISTANT, label: "Assistant" },
  { href: LANDING_SECTIONS.BUDGET, label: "Budgets" },
];

const appLinksBase: NavItem[] = [
  { href: ROUTES.DASHBOARD, label: "Dashboard" },
  { href: ROUTES.EXPENSES, label: "Expenses" },
  { href: ROUTES.INCOMES, label: "Incomes" },
  { href: ROUTES.CATEGORY, label: "Category" },
  { href: ROUTES.CALENDAR, label: "Calendar" },
  { href: ROUTES.BUDGETS, label: "Budgets" },
];

const isRouteActive = (route: string, href: string) =>
  href === ROUTES.DASHBOARD ? route === href : route.startsWith(href);

const Navigation = ({ landingPage = false }: Props) => {
  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);

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
    const html = document.documentElement;
    if (hamburgerMenuIsOpen) {
      html.classList.add("overflow-hidden");
    } else {
      html.classList.remove("overflow-hidden");
    }

    return () => {
      html.classList.remove("overflow-hidden");
    };
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    setHamburgerMenuIsOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (user && !userInfo) {
      getUserInfo();
    }
  }, [user, userInfo, getUserInfo]);

  const canAccessAssistant = isAssistantEmailAllowed(userInfo?.email);

  const appLinks = useMemo(() => {
    const links = [...appLinksBase];
    if (canAccessAssistant) {
      links.splice(1, 0, { href: ROUTES.ASSISTANT, label: "Assistant" });
    }
    return links;
  }, [canAccessAssistant]);

  const links = landingPage ? landingLinks : appLinks;

  return (
    <header
      className={clsx(
        "fixed left-0 top-0 z-[20] w-full border-b backdrop-blur-xl",
        landingPage
          ? "border-blue-100 bg-white/90"
          : "border-blue-100 bg-white/90 dark:border-blue-400/20 dark:bg-slate-950/70"
      )}
    >
      <div className="mx-auto flex h-navigation-height w-full max-w-[1200px] items-center px-5 md:px-8 lg:px-0">
        <Link
          href={landingPage ? ROUTES.HOME : ROUTES.DASHBOARD}
          className="flex items-center gap-3"
        >
          <span
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-xl p-2 text-white",
              landingPage
                ? "bg-blue-600"
                : "bg-blue-600 dark:bg-blue-500"
            )}
          >
            <Logo className="h-4 w-4 fill-current" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
            Expensasaurus
          </span>
        </Link>

        <nav className="ml-8 hidden items-center gap-1 md:flex lg:ml-12">
          {links.map((link) => {
            const active = !landingPage && isRouteActive(router.route, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  landingPage
                    ? "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white",
                  active &&
                    "bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:bg-blue-500 dark:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {landingPage && !userInfo && (
            <>
              <Link
                href={ROUTES.LOGIN}
                className="rounded-lg px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
              >
                Log in
              </Link>
              <Link
                href={ROUTES.SIGNUP}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Start free
              </Link>
            </>
          )}

          {userInfo && (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white dark:bg-blue-500"
                  aria-label="Open profile menu"
                >
                  {userInfo.name?.[0] || "U"}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="z-[9999] w-[180px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl focus:outline-none dark:border-white/10 dark:bg-slate-900"
                  sideOffset={8}
                  align="end"
                >
                  <div className="flex flex-col gap-1">
                    <Link
                      href={ROUTES.DASHBOARD}
                      className="rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={ROUTES.PROFILE}
                      className="rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => logout(router)}
                      className="rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    >
                      Logout
                    </button>
                  </div>
                  <Popover.Arrow className="fill-white dark:fill-slate-900" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          onClick={() => setHamburgerMenuIsOpen((open) => !open)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path d="M1 1H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M1 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M1 11H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className={clsx(
          "border-t border-slate-200/70 bg-white/95 px-5 pb-6 pt-4 transition md:hidden",
          hamburgerMenuIsOpen ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-[1200px] flex-col gap-1">
          {links.map((link) => {
            const active = !landingPage && isRouteActive(router.route, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                )}
                onClick={() => setHamburgerMenuIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}

          {landingPage && !userInfo && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href={ROUTES.LOGIN}
                className="rounded-lg border border-blue-200 px-3 py-2 text-center text-sm font-medium text-blue-700"
              >
                Log in
              </Link>
              <Link
                href={ROUTES.SIGNUP}
                className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white"
              >
                Start free
              </Link>
            </div>
          )}

          {userInfo && (
            <div className="mt-3 grid grid-cols-1 gap-2">
              <Link
                href={ROUTES.PROFILE}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => logout(router)}
                className="rounded-lg border border-rose-200 px-3 py-2 text-left text-sm font-medium text-rose-600"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
