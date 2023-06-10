import { format } from "date-fns";

const useDates = () => {
    const today = new Date();
    const startOfThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    ).toISOString();
    const endOfThisMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
    ).toISOString();
    const startOfEarlierMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
    ).toISOString();
    const endOfEarlierMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    ).toISOString();

    return {
        startOfThisMonth,
        endOfThisMonth,
        startOfEarlierMonth,
        endOfEarlierMonth
    }

}

export const dataFormatterLoading = (number: number) =>
    `$ ${Intl.NumberFormat("us").format(number).toString()}`;

export const currentMonth = format(new Date(), "MMMM");


export default useDates