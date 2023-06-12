import { ENVS } from "./constants/constants";
import { ID, database } from "./services/appwrite";

export const seed = async () => {
    data1.forEach(async (transaction) => {
        await database.createDocument(ENVS.DB_ID, ENVS.COLLECTIONS.EXPENSES, ID.unique(), transaction);
    })

}


export const data = [

    {
        amount: 15000,
        category: "food",
        currency: "INR",
        date: "2023-06-04T08:00:00.000Z",
        description: "Dinner at a fancy restaurant",
        tag: "dining out",
        title: "Fine Dining Experience",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 8000,
        category: "entertainment",
        currency: "INR",
        date: "2023-06-05T14:30:00.000Z",
        description: "Movie tickets for a new release",
        tag: "movies",
        title: "Movie Night Out",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 12000,
        category: "housing",
        currency: "INR",
        date: "2023-06-06T10:00:00.000Z",
        description: "Monthly rent payment",
        tag: "rent",
        title: "Rent Payment",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 18000,
        category: "transportation",
        currency: "INR",
        date: "2023-06-07T09:15:00.000Z",
        description: "Train tickets for a weekend getaway",
        tag: "travel",
        title: "Weekend Trip",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 10000,
        category: "healthcare",
        currency: "INR",
        date: "2023-06-08T11:45:00.000Z",
        description: "Doctor's consultation fees",
        tag: "medical",
        title: "Health Checkup",
        userId: "6467f19d71dc0cdf41b7",
    },
]

export const data1 = [
    {
        amount: 3200,
        category: "housing",
        currency: "INR",
        date: "2023-06-07T11:45:00.000Z",
        description: "Monthly rent payment",
        tag: "rent",
        title: "Rent",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 4500,
        category: "transportation",
        currency: "INR",
        date: "2023-06-08T08:15:00.000Z",
        description: "Fuel for the car",
        tag: "fuel",
        title: "Car Fuel",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 2500,
        category: "transportation",
        currency: "INR",
        date: "2023-06-07T08:45:00.000Z",
        description: "Taxi fare to the airport",
        tag: "Transport",
        title: "Airport Transfer",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 3800,
        category: "healthcare",
        currency: "INR",
        date: "2023-06-08T11:15:00.000Z",
        description: "Doctor's consultation and medication",
        tag: "Medical",
        title: "Health Checkup",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 4800,
        category: "education",
        currency: "INR",
        date: "2023-06-10T14:00:00.000Z",
        description: "Tuition fee for the semester",
        tag: "Education",
        title: "Semester Fee",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 1800,
        category: "personal",
        currency: "INR",
        date: "2023-06-14T16:45:00.000Z",
        description: "Gift for a friend's birthday",
        tag: "Gift",
        title: "Birthday Surprise",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 3800,
        category: "travel",
        currency: "INR",
        date: "2023-06-17T13:20:00.000Z",
        description: "Flight tickets for a weekend getaway",
        tag: "Travel",
        title: "Weekend Trip",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 4700,
        category: "entertainment",
        currency: "INR",
        date: "2023-06-19T19:00:00.000Z",
        description: "Concert tickets for favorite band",
        tag: "Concert",
        title: "Live Music Experience",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 2500,
        category: "education",
        currency: "INR",
        date: "2023-06-22T10:30:00.000Z",
        description: "Enrollment fee for an online course",
        tag: "Online Course",
        title: "Continuous Learning",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 3000,
        category: "healthcare",
        currency: "INR",
        date: "2023-06-15T08:00:00.000Z",
        description: "Doctor's consultation fee",
        tag: "Health Checkup",
        title: "Routine Checkup",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 1500,
        category: "travel",
        currency: "INR",
        date: "2023-06-25T15:00:00.000Z",
        description: "Train ticket for a weekend getaway",
        tag: "Weekend Trip",
        title: "Escape to Nature",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 4000,
        category: "personal",
        currency: "INR",
        date: "2023-06-28T12:30:00.000Z",
        description: "Spa and wellness session",
        tag: "Self-care",
        title: "Pamper Yourself",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 4500,
        category: "insurance",
        currency: "INR",
        date: "2023-03-07T10:00:00.000Z",
        description: "Health Insurance Premium",
        tag: "medical",
        title: "Health Insurance",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 2500,
        category: "savings",
        currency: "INR",
        date: "2023-03-09T15:30:00.000Z",
        description: "Monthly Savings Contribution",
        tag: "savings",
        title: "Monthly Savings",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 3500,
        category: "investments",
        currency: "INR",
        date: "2023-03-11T09:45:00.000Z",
        description: "Stock Market Investment",
        tag: "investments",
        title: "Stock Investment",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 4000,
        category: "utilities",
        currency: "INR",
        date: "2023-03-13T14:15:00.000Z",
        description: "Electricity Bill Payment",
        tag: "bills",
        title: "Electricity Bill",
        userId: "6467f19d71dc0cdf41b7",
    },
    {
        amount: 3000,
        category: "business",
        currency: "INR",
        date: "2023-03-15T11:30:00.000Z",
        description: "Office Supplies Purchase",
        tag: "business",
        title: "Office Expenses",
        userId: "6467f19d71dc0cdf41b7",
    },
]