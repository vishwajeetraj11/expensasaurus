import {
  BriefcaseIcon,
  DesktopComputerIcon,
  TruckIcon,
} from "@heroicons/react/solid";

export const categories = [
  {
    id: 1,
    category: "Food",
    description:
      "Expenses related to groceries, dining out, or food delivery services",
    Icon: TruckIcon,
  },
  {
    id: 2,
    category: "Entertainment",
    description:
      "Expenses related to activities or events for enjoyment or leisure, such as concerts, movies, or amusement parks",
    Icon: TruckIcon,
  },
  {
    id: 3,
    category: "Housing",
    description:
      "Expenses related to housing, such as rent or mortgage payments, property taxes, or home insurance",
    Icon: DesktopComputerIcon,
  },
  {
    id: 4,
    category: "Transportation",
    description:
      "Expenses related to transportation, such as gas, maintenance, or public transportation fees",
    Icon: TruckIcon,
  },
  {
    id: 5,
    category: "Healthcare",
    description:
      "Expenses related to healthcare, such as doctor visits, prescriptions, or health insurance premiums",
    Icon: TruckIcon,
  },
  {
    id: 6,
    category: "Travel",
    description:
      "Expenses related to travel, such as airfare, lodging, or rental cars",
    Icon: TruckIcon,
  },
  {
    id: 7,
    category: "Education",
    description:
      "Expenses related to education, such as tuition, books, or school supplies",
    Icon: TruckIcon,
  },
  {
    id: 8,
    category: "Personal Care",
    description:
      "Expenses related to personal grooming and hygiene, such as haircuts, beauty products, or toiletries",
    Icon: TruckIcon,
  },
  {
    id: 9,
    category: "Insurance",
    description:
      "Expenses related to insurance, such as car insurance, health insurance, or life insurance",
    Icon: TruckIcon,
  },
  {
    id: 10,
    category: "Savings",
    description:
      "Expenses related to savings, such as contributions to a savings account or retirement account",
    Icon: TruckIcon,
  },
  {
    id: 11,
    category: "Investments",
    description:
      "Expenses related to investments, such as contributions to a 401(k) or IRA",
    Icon: TruckIcon,
  },
  {
    id: 12,
    category: "Utilities",
    description:
      "Expenses related to utilities, such as electricity, gas, or water",
    Icon: TruckIcon,
  },
  {
    id: 13,
    category: "Business",
    description:
      "Expenses related to running a business, such as rent, utilities, or employee salaries",
    Icon: BriefcaseIcon,
  },
  {
    id: 15,
    category: "Other",
    description: "Expenses that do not fit into any other category",
    Icon: TruckIcon,
  },
] as const;

export const incomeCategories = [
  {
    id: 1,
    Icon: TruckIcon,
    category: "Salary",
    description: "Regular income earned from employment.",
  },
  {
    id: 2,
    Icon: TruckIcon,
    category: "Freelance/Contract Work",
    description: "Income earned from freelance projects or contract work.",
  },
  {
    id: 3,
    Icon: TruckIcon,
    category: "Investments",
    description:
      "Income generated from investments such as stocks, bonds, or real estate.",
  },
  {
    id: 4,
    Icon: TruckIcon,
    category: "Rental Income",
    description: "Income received from renting out properties or assets.",
  },
  {
    id: 5,
    Icon: TruckIcon,
    category: "Business Income",
    description: "Income generated from a business or self-employment.",
  },
  {
    id: 6,
    Icon: TruckIcon,
    category: "Interest/Dividends",
    description:
      "Income earned from interest on savings accounts or dividends from investments.",
  },
  {
    id: 7,
    Icon: TruckIcon,
    category: "Pension/Social Security",
    description:
      "Income received from retirement pensions or government social security programs.",
  },
  {
    id: 8,
    Icon: TruckIcon,
    category: "Gifts/Inheritance",
    description:
      "Income received as gifts or inheritance from family or friends.",
  },
  {
    id: 9,
    Icon: TruckIcon,
    category: "Royalties",
    description:
      "Income earned from the use of intellectual property, such as copyrights or patents.",
  },
  {
    id: 10,
    Icon: TruckIcon,
    category: "Side Hustle/Part-time Work",
    description: "Income earned from part-time jobs or side businesses.",
  },
  {
    id: 11,
    Icon: TruckIcon,
    category: "Other",
    description:
      "A general category to cover any income source that does not fit into the predefined categories.",
  },
];

export const categoryNames: string[] = categories.map(
  (category) => category.category
);
