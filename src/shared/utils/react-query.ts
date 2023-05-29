import { DateRangePickerValue } from "@tremor/react";
import { Models, Query } from "appwrite";
import { isEqual, isValid } from "date-fns";
import { Transaction } from "../types/transaction";

type params = {
    user: Models.Session,
    limit?: number,
    orderByDesc?: keyof Transaction,
    orderByAesc?: keyof Transaction,
    dates: DateRangePickerValue,
    query?: string,
    minAmount?: string,
    maxAmount?: string,
    category?: string
    tag?: string
}

export const getQueryForExpenses = ({
    user, limit, orderByDesc, dates, query, minAmount, maxAmount, category, tag
}: params) => {
    const result = [];
    const userId = user?.userId;

    const validDates = dates.filter((date) => {
        return isValid(date)
    }) as Date[];

    if (validDates.length > 0) {

        const startOfDay = new Date(
            validDates[0].getFullYear(),
            validDates[0].getMonth(),
            validDates[0].getDate()
        ).toISOString();

        const endOfTheDay = new Date(
            validDates[0].getFullYear(),
            validDates[0].getMonth(),
            validDates[0].getDate() + 1
        ).toISOString();

        if (startOfDay) {
            result.push(Query.greaterThanEqual('date', startOfDay))
        }

        if (validDates?.[1] && !isEqual(validDates[1], validDates[0])) {
            const lastDateMarked = new Date(
                validDates[1].getFullYear(),
                validDates[1].getMonth(),
                validDates[1].getDate()
            ).toISOString();
            result.push(Query.lessThanEqual('date', lastDateMarked))
        } else {
            // toast.error('Both dates equal')
            result.push(Query.lessThanEqual('date', endOfTheDay))
        }
    }

    if (minAmount) { result.push(Query.greaterThanEqual('amount', parseFloat(minAmount) - 0.01)) }
    if (maxAmount) { result.push(Query.lessThanEqual('amount', parseFloat(maxAmount) - 0.01)) }
    if (category) { result.push(Query.equal('category', category)) }
    if (tag) { result.push(Query.equal('tag', tag)) }

    if (query) {
        result.push(Query.search("title", query))
    }

    if (userId) { result.push(Query.equal("userId", user?.userId)) }
    if (limit) { result.push(Query.limit(limit)) }
    if (orderByDesc) { result.push(Query.orderDesc(orderByDesc)) }
    return result
}

type categoryParams = Pick<params, 'dates' | 'user'>

export const getQueryForCategoryPage = ({
    user, dates
}: categoryParams) => {
    const result = [];
    const validDates = dates.filter((date) => {
        return isValid(date)
    }) as Date[];

    if (validDates.length > 0) {

        const startOfTheMonth = new Date(
            validDates[0].getFullYear(),
            validDates[0].getMonth(),
            validDates[0].getDate()
        ).toISOString();

        const endOfTheDayForStartOfMonth = new Date(
            validDates[0].getFullYear(),
            validDates[0].getMonth(),
            validDates[0].getDate() + 1
        ).toISOString();

        if (startOfTheMonth) {
            result.push(Query.greaterThanEqual('date', startOfTheMonth))
        }

        if (validDates?.[1] && !isEqual(validDates[1], validDates[0])) {
            const lastDateMarked = new Date(
                validDates[1].getFullYear(),
                validDates[1].getMonth(),
                validDates[1].getDate()
            ).toISOString();
            result.push(Query.lessThanEqual('date', lastDateMarked))
        } else {
            // toast.error('Both dates equal')
            result.push(Query.lessThanEqual('date', endOfTheDayForStartOfMonth))
        }
    }

    return [Query.equal("userId", user?.userId), ...result]
}