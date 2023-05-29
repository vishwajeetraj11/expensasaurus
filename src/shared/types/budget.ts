
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
    personalcare?: number;
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
    $id: string;
    $createdAt: Date;
    $updatedAt: Date;
    $permissions: string[];
    $collectionId: string;
    $databaseId: string;
}
