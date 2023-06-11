import Image from "next/image"

const HowItWorks = () => {
    return (
        <div id="how-it-works" style={{
            scrollMargin: 100
        }} className="relative w-full">
            <div className="w-full pl-4 lg:max-w-[1200px] mx-auto pt-8 md:py-10">
                <h4 className="text-[28px] text-center">How it works</h4>
                <div className="w-full pt-8 md:py-10 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex flex-col gap-10">
                        {howitWorksData.map(step => (
                            <div key={step.id} className="max-w-[29rem]">
                                <div className="text-[24px] mb-4 font-thin">{step.title}</div>
                                <div className="text-slate-700 text-[16px]">{step.description}</div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Image alt="How it works." width={700} height={900} className="z-[-1] mt-4 md:mt-0 md:opacity-30 lg:opacity-100 md:absolute md:right-0 md:top-[50%] md:translate-y-[-50%]" src='/showcase1.png' />
                    </div>
                </div>
            </div>
        </div>
    )
}

const howitWorksData = [
    {
        id: 1,
        title: 'Create an account',
        description: 'Create your free account on Expensasaures by providing your basic details. It only takes a few minutes to get started.',
    },
    {
        id: 2,
        title: 'Set Your Budget',
        description: 'Define your budget by allocating spending limits to different categories, such as food, transportation, entertainment, and more. Customize it to match your unique financial goals.',
    },
    {
        id: 3,
        title: 'Track Your Expenses and Income',
        description: 'Enter your expenses and income with ease. Add transactions, categorize them, and keep a comprehensive record of your financial activities to maintain an accurate overview.',
    },
    {
        id: 4,
        title: 'Monitor Your Budget',
        description: `Keep a close eye on your budget's progress with real-time updates. Visualize your spending patterns, track category-wise expenses, and receive notifications to stay within your limits.`,
    },
    {
        id: 5,
        title: 'Analyze Your Finances',
        description: 'Gain valuable insights into your financial habits with our intuitive analysis tools. Explore interactive charts and reports to understand where your money is going and make informed decisions.',
    },
    {
        id: 6,
        title: 'Adjust and Optimize',
        description: 'Fine-tune your budget as needed based on your financial goals and changing circumstances. Modify spending limits, add new categories, or reallocate funds to optimize your budget.'
    }
]

export default HowItWorks