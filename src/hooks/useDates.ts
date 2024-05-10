import { format } from "date-fns";
import { months } from "expensasaurus/shared/constants/constants";

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


export const useDynamicDates = (activeMonth: string) => {
    const monthIndex = months.findIndex(month => month === activeMonth);
    const today = new Date();
    const startOfTheMonth = new Date(
        today.getFullYear(),
        monthIndex,
        1
    ).toISOString();
    const endOfTheMonth = new Date(
        today.getFullYear(),
        monthIndex + 1,
        1
    ).toISOString();
    const startOfEarlierMonth = new Date(
        today.getFullYear(),
        monthIndex - 1,
        1
    ).toISOString();
    const endOfEarlierMonth = new Date(
        today.getFullYear(),
        monthIndex,
        1
    ).toISOString();

    return {
        startOfTheMonth,
        endOfTheMonth,
        startOfEarlierMonth,
        endOfEarlierMonth
    }

}

export const dataFormatterLoading = (number: number) =>
    `$ ${Intl.NumberFormat("us").format(number).toString()}`;

export const currentMonth = format(new Date(), "MMMM");

export const currentMonthIndex = new Date().getMonth().toString();

export default useDates