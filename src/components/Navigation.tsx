import Link from "next/link";
import { Logo } from "./icons/svg";

const Navigation = () => {
  return (
    <div className=" ">
      <div className="max-w-[1200px] mx-auto py-2 flex items-center justify-between ">
        <div>
          <Logo width={40} height={40} />
        </div>
        <div className="flex gap-4">
          <Link href={"/dashboard"}>
            <p className="px-4 py-2 rounded-full">Dashboard</p>
          </Link>
          <Link href={"/expenses"}>
            <p className="px-4 py-2 rounded-full">Expense</p>
          </Link>
          <Link href={"/category"}>
            <p className="px-4 py-2 rounded-full">Category</p>
          </Link>
          <Link href={"/calender"}>
            <p className="px-4 py-2 rounded-full">Calender</p>
          </Link>
          <Link href={"/budgets"}>
            <p className="px-4 py-2 rounded-full">Budget</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
