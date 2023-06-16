# Expensasaurus

<img width="1449" alt="Screenshot 2023-06-13 at 11 58 22 PM" src="https://github.com/vishwajeetraj11/expensasaurus/assets/47270995/d317f556-9cee-430e-8fc9-841d15527ef2">

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

# Application Workflow
<img width="1183" alt="Screenshot 2023-06-12 at 10 32 52 AM" src="https://github.com/vishwajeetraj11/expensasaurus/assets/47270995/3cd6f18c-9f13-490c-a939-cbef9e83d495">

# Screenshot 

<img width="1260" alt="Screenshot 2023-06-11 at 6 15 15 PM" src="https://github.com/vishwajeetraj11/expensasaurus/assets/47270995/bff691b1-96ea-43da-8709-0afdb57ea96c">
<img width="1260" alt="Screenshot 2023-06-11 at 6 15 01 PM" src="https://github.com/vishwajeetraj11/expensasaurus/assets/47270995/913b4395-619a-407b-86c8-4756c0423aa7">
<img width="1260" alt="Screenshot 2023-06-11 at 6 14 53 PM" src="https://github.com/vishwajeetraj11/expensasaurus/assets/47270995/3f5484ac-e4af-44bf-bb2b-e9d1335d5dd3">
<img width="1260" alt="Screenshot 2023-06-11 at 5 30 18 PM" src="https://github.com/vishwajeetraj11/expensasaurus/assets/47270995/9489020e-2e22-4e93-9b5f-98af05b1a774">



