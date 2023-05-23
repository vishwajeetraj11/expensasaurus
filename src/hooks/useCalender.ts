import { Models, Query } from "appwrite";
import {
    add,
    eachDayOfInterval,
    endOfMonth,
    format,
    parse,
    startOfToday
} from "date-fns";

import useDates from "expensasaures/hooks/useDates";
import { getAllLists } from "expensasaures/shared/services/query";
import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { Transaction } from "expensasaures/shared/types/transaction";
import { useState } from "react";
import { shallow } from "zustand/shallow";

export const useCalender = () => {
    let today = startOfToday();
    let [selectedDay, setSelectedDay] = useState(today);

    const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
        user: Models.Session;
    };

    const startOfDay = new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate()
    ).toISOString();

    const endOfDay = new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate() + 1
    ).toISOString();

    const { data } = getAllLists<Transaction>(
        ["Expenses", user?.userId, selectedDay],
        [
            "6467f9811c14ca905ed5",
            "6467f98b8e8fe5ffa576",
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfDay),
                Query.greaterThan("date", startOfDay),
            ],
        ],
        { enabled: !!user, staleTime: Infinity }
    );

    const { endOfThisMonth, startOfThisMonth } = useDates();

    const { data: thisMonthExpenses } = getAllLists<Transaction>(
        ["Expenses", "Stats this month", user?.userId],
        [
            "6467f9811c14ca905ed5",
            "6467f98b8e8fe5ffa576",
            [
                Query.equal("userId", user?.userId),
                Query.lessThanEqual("date", endOfThisMonth),
                Query.greaterThan("date", startOfThisMonth),
                Query.orderAsc("date"),
            ],
        ],
        { enabled: !!user }
    );

    let [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
    let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

    let days = eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
    });

    const previousMonth = () => {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    };

    const nextMonth = () => {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    };



    return {
        selectedDay,
        setSelectedDay,
        data,
        thisMonthExpenses,
        currentMonth,
        days,
        previousMonth,
        nextMonth,
        firstDayCurrentMonth
    }
}