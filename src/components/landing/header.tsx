import { Button } from "@tremor/react"
import Image from "next/image"
import Link from "next/link"

const Header = () => {
    return (
        <header className="flex mt-10 flex-col items-center justify-center">


            <h1 className="text-blue-600 mb-4 text-center w-[80%] font-thin text-[40px] md:text-[60px]">
                {/* Spending made smarter */}
                Welcome to Expensasaures
            </h1>
            <h3 className="text-center w-[88%] md:w-[70%] text-[18px] md:text-[20px] mb-7 text-slate-700">Take control of your finances with Expensasaures, the ultimate budgeting tool. Our intuitive platform helps you track expenses, manage budgets, and achieve your financial goals. Get started today and experience hassle-free budget management.</h3>
            <Link href='/signup'>
                <Button
                    type="button"
                    className="border-0 w-min px-10 py-4 rounded-xl bg-blue-600 md:text-base font-medium text-white transition duration-200 hover:bg-blue-700 active:bg-blue-700"
                >
                    Sign Up Now
                </Button>
            </Link>


            <Image height={1000} className="mt-10" width={1000} alt="Mac Book and iPhone with expensasaures web application." priority src='/dashboard.png' />

        </header>
    )
}

export default Header