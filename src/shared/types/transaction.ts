import { DeltaType } from "@tremor/react";

export interface Transaction {
    $collectionId: string;
    $createdAt: string;
    $databaseId: string;
    $id: string;
    $permissions: string[];
    $updatedAt: string;
    amount: number;
    category: string;
    currency: string;
    date: string;
    description: string;
    tag: string;
    title: string;
    userId: string;
}

export interface DashboardStat {
    title: string;
    metric: string;
    metricPrev?: string;
    delta: string;
    deltaType: DeltaType;
}