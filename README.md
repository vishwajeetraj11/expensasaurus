# Expensasaurus

# Local Setup
- Make a project on Appwrite
- Make a database (copy database ID)
- Make 3 collections (copy their IDs) for expenses, budgets, incomes.
- Make a bucket (copy ID)
- Make a .env file containing.
```
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<project ID>
NEXT_PUBLIC_APPWRITE_ENDPOINT=<appwrite endpoint> (you get this when creating your project on appwrite)
NEXT_PUBLIC_DATABASE_ID=<db ID>
NEXT_PUBLIC_EXPENSES_COLLECTION_ID=<expenses collection ID>
NEXT_PUBLIC_INCOMES_COLLECTION_ID=<incomes collection ID>
NEXT_PUBLIC_BUDGETS_COLLECTION_ID=<budgets collection ID>
NEXT_PUBLIC_BUCKET_ID=<bucket storage ID>
```
- Make relevant indexes.
```
Keeping these interfaces/types in mind. (these are attributes).

Transaction -> expenses / incomes.
Budget -> budget

export interface Transaction {
    amount: number;
    category: string;
    currency: string;
    date: string;
    description: string;
    tag: string;
    title: string;
    userId: string;
    attachments?: string[];
}

export type Budget = {
    title: string;
    description: string;
    userId: string;
    food?: number;
    transportation?: number;
    travel?: number;
    housing?: number;
    healthcare?: number;
    education?: number;
    personal?: number;
    insurance?: number;
    savings?: number;
    investments?: number;
    business?: number;
    utilities?: number;
    other?: number;
    amount: number;
    entertainment?: number;
    startingDate: string;
    endDate: string;
    currency: string;
}

```
- Install dependencies
- yarn dev
