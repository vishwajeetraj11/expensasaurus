import {
  AcademicCapIcon,
  AdjustmentsIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FilmIcon,
  GlobeIcon,
  HomeIcon,
  LibraryIcon,
  PlusIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserCircleIcon,
} from "@heroicons/react/solid";

export const categories = [
  {
    id: 1,
    category: "Food",
    key: "food",
    description:
      "Expenses related to groceries, dining out, or food delivery services",
    Icon: ShoppingBagIcon,
    className: "bg-teal-500 text-teal-500",
  },
  {
    id: 2,
    category: "Entertainment",
    key: "entertainment",
    description:
      "Expenses related to activities or events for enjoyment or leisure, such as concerts, movies, or amusement parks",
    Icon: FilmIcon,
    className: "bg-yellow-500 text-yellow-500",
  },
  {
    id: 3,
    category: "Housing",
    key: "housing",
    description:
      "Expenses related to housing, such as rent or mortgage payments, property taxes, or home insurance",
    Icon: HomeIcon,
    className: "bg-orange-500 text-orange-500",
  },
  {
    id: 4,
    category: "Transportation",
    key: "transportation",
    description:
      "Expenses related to transportation, such as gas, maintenance, or public transportation fees",
    Icon: TruckIcon,
    className: "bg-indigo-500 text-indigo-500",
  },
  {
    id: 5,
    category: "Healthcare",
    key: "healthcare",
    description:
      "Expenses related to healthcare, such as doctor visits, prescriptions, or health insurance premiums",
    Icon: PlusIcon,
    className: "bg-green-500 text-green-500",
  },
  {
    id: 6,
    category: "Travel",
    key: "travel",
    description:
      "Expenses related to travel, such as airfare, lodging, or rental cars",
    Icon: GlobeIcon,
    className: "bg-purple-500 text-purple-500",
  },
  {
    id: 7,
    category: "Education",
    key: "education",
    description:
      "Expenses related to education, such as tuition, books, or school supplies",
    Icon: AcademicCapIcon,
    className: "bg-emerald-500 text-emerald-500",
  },
  {
    id: 8,
    category: "Personal",
    key: "personal",
    description:
      "Expenses related to personal grooming, hygiene and purchases.",
    Icon: UserCircleIcon,
    className: "bg-pink-300 text-pink-300",
  },
  {
    id: 9,
    category: "Insurance",
    key: "insurance",
    description:
      "Expenses related to insurance, such as car insurance, health insurance, or life insurance",
    Icon: CurrencyDollarIcon,
    className: "bg-sky-500 text-sky-500",
  },
  {
    id: 10,
    category: "Savings",
    key: "savings",
    description:
      "Expenses related to savings, such as contributions to a savings account or retirement account",
    Icon: LibraryIcon,
    className: "bg-cyan-500 text-cyan-500",
  },
  {
    id: 11,
    category: "Investments",
    key: "investments",
    description:
      "Expenses related to investments, such as contributions to a 401(k) or IRA",
    Icon: ChartBarIcon,
    className: "bg-sky-500 text-sky-500",
  },
  {
    id: 12,
    category: "Utilities",
    key: "utilities",
    description:
      "Expenses related to utilities, such as electricity, gas, or water",
    Icon: AdjustmentsIcon,
    className: "bg-red-500 text-red-500",
  },
  {
    id: 13,
    category: "Business",
    key: "business",
    description:
      "Expenses related to running a business, such as rent, utilities, or employee salaries",
    Icon: BriefcaseIcon,
    className: "bg-blue-600 text-blue-600",
  },
  {
    id: 15,
    category: "Other",
    key: "other",
    description: "Expenses that do not fit into any other category",
    Icon: TruckIcon,
    className: "bg-yellow-500 text-yellow-500",
  },
] as const;

export const incomeCategories = [
  {
    id: 1,
    Icon: TruckIcon,
    key: "salary",
    category: "Salary",
    className: "bg-yellow-500 text-yellow-500",
    description: "Regular income earned from employment.",
  },
  {
    id: 2,
    Icon: TruckIcon,
    key: "freelance",
    category: "Freelance/Contract Work",
    className: "bg-yellow-500 text-yellow-500",
    description: "Income earned from freelance projects or contract work.",
  },
  {
    id: 3,
    Icon: TruckIcon,
    key: "investments",
    category: "Investments",
    className: "bg-yellow-500 text-yellow-500",
    description:
      "Income generated from investments such as stocks, bonds, or real estate.",
  },
  {
    id: 4,
    Icon: TruckIcon,
    key: "rental",
    category: "Rental Income",
    className: "bg-yellow-500 text-yellow-500",
    description: "Income received from renting out properties or assets.",
  },
  {
    id: 5,
    Icon: TruckIcon,
    key: "business",
    category: "Business Income",
    className: "bg-yellow-500 text-yellow-500",
    description: "Income generated from a business or self-employment.",
  },
  {
    id: 6,
    Icon: TruckIcon,
    key: "interest",
    className: "bg-yellow-500 text-yellow-500",
    category: "Interest/Dividends",
    description:
      "Income earned from interest on savings accounts or dividends from investments.",
  },
  {
    id: 7,
    Icon: TruckIcon,
    key: "pension",
    category: "Pension/Social Security",
    className: "bg-yellow-500 text-yellow-500",
    description:
      "Income received from retirement pensions or government social security programs.",
  },
  {
    id: 8,
    Icon: TruckIcon,
    key: "gift",
    category: "Gifts/Inheritance",
    className: "bg-yellow-500 text-yellow-500",
    description:
      "Income received as gifts or inheritance from family or friends.",
  },
  {
    id: 9,
    Icon: TruckIcon,
    key: "royalties",
    category: "Royalties",
    className: "bg-yellow-500 text-yellow-500",
    description:
      "Income earned from the use of intellectual property, such as copyrights or patents.",
  },
  {
    id: 10,
    Icon: TruckIcon,
    key: "sidehustle",
    category: "Side Hustle/Part-time Work",
    className: "bg-yellow-500 text-yellow-500",
    description: "Income earned from part-time jobs or side businesses.",
  },
  {
    id: 11,
    Icon: TruckIcon,
    key: "other",
    category: "Other",
    className: "bg-yellow-500 text-yellow-500",
    description:
      "A general category to cover any income source that does not fit into the predefined categories.",
  },
];

export const categoryNames: string[] = categories.map(
  (category) => category.category
);

export const categoryKeys = categories.map((category) => category.key);
export type categoryKey = (typeof categoryKeys)[number];

export type ExpensesByCategory = {
  [key in categoryKey]: number;
};
