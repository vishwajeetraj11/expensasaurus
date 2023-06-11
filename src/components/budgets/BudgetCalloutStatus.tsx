import { CheckCircleIcon, ExclamationIcon } from '@heroicons/react/outline';
import { Callout, Subtitle } from '@tremor/react';

interface BudgetStatusProps {
    type: 'fail' | 'success' | 'on-track'
}





const BudgetStatus = (props: BudgetStatusProps) => {
    const { type } = props;
    const isFail = type === 'fail';
    const isSuccess = type === 'success';
    const isOnTrack = type === 'on-track';

    const title = isOnTrack ? 'Budget Update' : isSuccess ? 'Budget Success' : 'Budget Exceeded';
    const description = isOnTrack ? `
    Great job keeping an eye on your budget! 
    
    Your expenses are well within the allocated amounts for each category. By staying vigilant and monitoring your spending, you're ensuring that you're on track towards your financial goals. Keep up the good work! Remember, regular check-ins on your budget can help you maintain control over your finances and make informed decisions. 
    
    If you notice any areas where you can save more or optimize your expenses, feel free to make adjustments accordingly. 
    Your commitment to budget management will continue to pay off in the long run.
     `: isSuccess ? `
     Congratulations! You've successfully managed your budget and achieved your financial goals across all categories. Your dedication and financial discipline have paid off, putting you on a path to financial success.

     By effectively allocating your funds and staying within your budget limits for each category, you've demonstrated excellent financial planning and control. This accomplishment is a testament to your commitment to smart spending and saving habits.

     Well done, and keep up the fantastic work on your budgeting journey!
     ` : `
     We noticed that your budget has been exceeded in some categories.  It's important to keep track of your expenses to stay within your planned budget. 
     
     Analyzing your spending patterns and making adjustments can help you regain control over your finances. 
      Take a closer look at the categories where you have exceeded your budget and consider finding ways to cut down on expenses or redistribute funds. 
     
     Remember, financial discipline is key to achieving your financial goals. Keep working towards better budget management, and you'll soon be back on track!
      `
    const Icon = isOnTrack ? CheckCircleIcon : isSuccess ? CheckCircleIcon : ExclamationIcon;
    const color = isOnTrack ? 'green' : isFail ? 'red' : 'green';

    return (
        <>

            <Callout className="mt-10" title={title} icon={Icon} color={color}>
                <Subtitle className="whitespace-pre-line text-slate-600 dark:text-slate-50/50 w-[90%] md:w-[80%]">
                    {description}
                </Subtitle>
            </Callout>
        </>
    )
}

export default BudgetStatus