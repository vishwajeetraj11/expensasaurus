import Link from "next/link";
import { ROUTES } from "expensasaurus/shared/constants/routes";
import { BsGithub, BsTwitter } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="w-full border-t border-blue-200 bg-blue-50 px-5 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-blue-800/80">
          © Expensasaurus {new Date().getFullYear()} · Smarter budgeting and
          tracking.
        </p>

        <div className="sm:ml-auto flex items-center gap-2">
          <Link
            href={ROUTES.LOGIN}
            className="rounded-lg px-3 py-1.5 text-sm text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
          >
            Log in
          </Link>
          <Link
            href={ROUTES.SIGNUP}
            className="rounded-lg px-3 py-1.5 text-sm text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
          >
            Sign up
          </Link>
          <a
            href="https://github.com/vishwajeetraj11"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
            aria-label="GitHub"
          >
            <BsGithub />
          </a>
          <a
            href="https://twitter.com/Vishwajeet323"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
            aria-label="Twitter"
          >
            <BsTwitter />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
