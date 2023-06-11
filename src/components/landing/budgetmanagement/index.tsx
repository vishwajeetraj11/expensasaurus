"use client";

import { AiOutlineBarChart } from "react-icons/ai";
import { BiCategoryAlt } from "react-icons/bi";
import { GrAnalytics } from "react-icons/gr";
import { MdOutlineMoneyOffCsred } from "react-icons/md";
import { TbHeartRateMonitor } from "react-icons/tb";
import { Features } from "./Features";


export const BudgetManagement = () => {
    return (
        <Features color="#2152ff" colorDark="33,82,255">
            <Features.Main
                title={
                    <>
                        Seamless Budget
                        <br />
                        Control and Analysis
                    </>
                }
                image="/budget.png"
                imageSize="large"
                text="Set personalized budgets for different categories, such as food, transportation, entertainment, and more. Stay on track and monitor your progress to achieve your financial goals."
            />
            <Features.Grid
                features={[
                    {
                        icon: BiCategoryAlt,
                        title: "Category Overview.",
                        text: "Overview of categories, transactions, and expenses.",
                    },
                    {
                        icon: GrAnalytics,
                        title: "Category Analysis.",
                        text: "Analyze categories with graphical or tabular representation.",
                    },
                    {
                        icon: MdOutlineMoneyOffCsred,
                        title: "Categories with No Budget.",
                        text: "Identify spending without defined budgets.",
                    },
                    {
                        icon: TbHeartRateMonitor,
                        title: "Budget Status",
                        text: "Monitor budget limits and spending.",
                    },
                    {
                        icon: () => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M448 160H320V128H448v32zM48 64C21.5 64 0 85.5 0 112v64c0 26.5 21.5 48 48 48H464c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM448 352v32H192V352H448zM48 288c-26.5 0-48 21.5-48 48v64c0 26.5 21.5 48 48 48H464c26.5 0 48-21.5 48-48V336c0-26.5-21.5-48-48-48H48z"></path></svg>),
                        title: "Progress Bar.",
                        text: "Visualize budget progress and consumption.",
                    },
                    {
                        icon: AiOutlineBarChart,
                        title: "Spending vs. Budget Graph",
                        text: "Compare actual spending with allocated budgets.",
                    },
                ]}
            />
        </Features>
    );
};
