import { Button } from "@tremor/react"
import Link from "next/link"

const CTASection = () => {
    return (
        <div className="py-5 md:py-10 bg-blue-600 px-8 w-full">
            <div className="py-10 md:py-20 max-w-[1200px] mx-auto w-full flex items-center flex-col">
                <p className="mb-4 text-center text-[24px] md:text-[40px] text-white">Unlock Financial Freedom with Expensasaurus</p>
                <p className="mb-6 text-center text-[18px] md:text-[24px] max-w-[90%] md:max-w-[80%] text-white">Start managing your budget effectively with expensasaurus.<br /> Sign up today and gain control over your financial future.</p>
                <Link href='/signup'>
                    <Button
                        type="button"
                        className="mt-2 border-0 w-min px-10 py-4 rounded-xl bg-white md:text-base font-medium text-blue-700 transition duration-200 hover:bg-white active:bg-white"
                    >
                        Sign Up Now
                    </Button>
                </Link>
            </div>

        </div>
    )
}

export default CTASection