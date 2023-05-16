export const categories = [
  {
    category: "Food",
    description:
      "Expenses related to groceries, dining out, or food delivery services",
  },
  {
    category: "Entertainment",
    description:
      "Expenses related to activities or events for enjoyment or leisure, such as concerts, movies, or amusement parks",
  },
  {
    category: "Lifestyle",
    description:
      "Expenses related to personal preferences and lifestyle choices, such as gym memberships, clothing, or hobbies",
  },
  {
    category: "Housing",
    description:
      "Expenses related to housing, such as rent or mortgage payments, property taxes, or home insurance",
  },
  {
    category: "Transportation",
    description:
      "Expenses related to transportation, such as gas, maintenance, or public transportation fees",
  },
  {
    category: "Healthcare",
    description:
      "Expenses related to healthcare, such as doctor visits, prescriptions, or health insurance premiums",
  },
  {
    category: "Travel",
    description:
      "Expenses related to travel, such as airfare, lodging, or rental cars",
  },
  {
    category: "Education",
    description:
      "Expenses related to education, such as tuition, books, or school supplies",
  },
  {
    category: "Personal Care",
    description:
      "Expenses related to personal grooming and hygiene, such as haircuts, beauty products, or toiletries",
  },
  {
    category: "Debt",
    description:
      "Expenses related to paying off debt, such as credit card payments or loan payments",
  },
  { category: "Insurance", description: "Monthly car insurance premium" },
  {
    category: "Savings",
    description: "Monthly contribution to emergency fund",
  },
  {
    category: "Investments",
    description: "Monthly contribution to retirement account",
  },
  { category: "Business", description: "Monthly rent for office space" },
  {
    category: "Charitable donations",
    description: "Monthly donation to local animal shelter",
  },
  { category: "Subscriptions", description: "Monthly subscription to Netflix" },
  { category: "Taxes", description: "Quarterly estimated income tax payment" },
  { category: "Utilities", description: "Monthly electricity bill" },
  {
    category: "Home maintenance",
    description: "Quarterly pest control service",
  },
  {
    category: "Retirement",
    description: "Monthly contribution to senior living fund",
  },
  {
    category: "Personal development",
    description: "Monthly subscription to online course platform",
  },
  {
    category: "Gifts and celebrations",
    description: "Birthday gift for a friend",
  },
  { category: "Automotive", description: "Annual registration fee for car" },
  { category: "Home improvement", description: "New living room furniture" },
  { category: "Communication", description: "Monthly cell phone bill" },
  { category: "Pet care", description: "Quarterly vet visit for cat" },
  {
    category: "Childcare and education",
    description: "Monthly tuition payment for child's school",
  },
  { category: "Personal care", description: "Haircut and color appointment" },
  { category: "Hobbies", description: "New golf clubs" },
  { category: "Loans", description: "Monthly car loan payment" },
] as const;

export const categoryNames = categories.map((category) => category.category);
