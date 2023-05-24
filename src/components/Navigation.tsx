import Link from "next/link";

const Navigation = () => {
  return (
    <div className="max-w-[1200px] mx-auto flex items-center justify-between">
      <div>Logo</div>
      <div className="flex gap-4">
        <Link href={"/dashboard"}>Dashboard</Link>
        <Link href={"/expenses"}>Expense</Link>
        <Link href={"/category"}>Category</Link>
        <Link href={"/calender"}>Calender</Link>
        <Link href={"/budgets"}>Budget</Link>
      </div>
    </div>
  );
};

export default Navigation;
