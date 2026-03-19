import { AppwriteException, Models, Query, Role } from "appwrite";
import {
  addMonths,
  endOfMonth,
  format,
  isWithinInterval,
  set,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  SplitwiseApiSyncResponse,
  SplitwisePayload,
} from "expensasaurus/features/splitwise/types";
import { ENVS } from "./constants/constants";
import { ID, Permission, account, database } from "./services/appwrite";

type SeedTransaction = {
  amount: number;
  category: string;
  currency: string;
  date: string;
  description: string;
  tag: string;
  title: string;
  userId: string;
};

type SeedBudget = {
  title: string;
  description: string;
  userId: string;
  amount: number;
  currency: string;
  startingDate: string;
  endDate: string;
  food?: number | null;
  transportation?: number | null;
  travel?: number | null;
  housing?: number | null;
  healthcare?: number | null;
  education?: number | null;
  personal?: number | null;
  insurance?: number | null;
  savings?: number | null;
  investments?: number | null;
  business?: number | null;
  utilities?: number | null;
  other?: number | null;
  entertainment?: number | null;
};

type ResetDemoDataParams = {
  userId: string;
  currency?: string;
  anchorDate?: Date;
};

type ResetDemoDataResult = {
  expenses: number;
  incomes: number;
  budgets: number;
  seedKey: string;
};

type EnsureDemoAccountResult = {
  session: Models.Session;
  userInfo: Models.User<Models.Preferences>;
  created: boolean;
};

const DEMO_MODE_FLAG = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
let activeDemoSeedPromise: Promise<ResetDemoDataResult> | null = null;
let activeDemoSeedKey: string | null = null;

export const DEMO_DEFAULTS = {
  email: process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@admin.io",
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD || "demopassword",
  name: process.env.NEXT_PUBLIC_DEMO_NAME || "demo",
  currency: (process.env.NEXT_PUBLIC_DEMO_CURRENCY || "INR").toUpperCase(),
  seedVersion: "showcase-v1",
  storageKey: "expensasaurus:demo-seed-key",
} as const;

export const DEMO_ASSISTANT_PROMPTS = [
  "Spent ₹480 on lunch and coffee today.",
  "Paid ₹3200 for groceries yesterday.",
  "Got ₹185000 salary on the 1st of this month.",
  "Received ₹28000 freelance payment today.",
  "Spent ₹12400 on a weekend trip last Saturday.",
] as const;

const normalizeEmail = (email?: string | null) =>
  (email || "").trim().toLowerCase();

const toNumber = (value: number, precision = 2) =>
  Number(value.toFixed(precision));

const roundToHundred = (value: number) =>
  Math.max(0, Math.round(value / 100) * 100);

export const isDemoModeEnabled = () => DEMO_MODE_FLAG;

export const isDemoModeEnabledForHost = (_host?: string | null) => DEMO_MODE_FLAG;

export const isDemoUserEmail = (email?: string | null) =>
  normalizeEmail(email) === normalizeEmail(DEMO_DEFAULTS.email);

export const isDemoUser = (
  user?: Pick<Models.User<Models.Preferences>, "email"> | null
) => isDemoUserEmail(user?.email);

export const getDemoSeedKey = (anchorDate = new Date()) =>
  `demo-seed:${DEMO_DEFAULTS.seedVersion}:${format(anchorDate, "yyyy-MM")}`;

export const getStoredDemoSeedKey = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_DEFAULTS.storageKey);
};

export const setStoredDemoSeedKey = (seedKey: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_DEFAULTS.storageKey, seedKey);
};

export const clearStoredDemoSeedKey = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_DEFAULTS.storageKey);
};

const getDocumentPermissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const getMonthDate = (
  anchorDate: Date,
  monthOffset: number,
  day: number,
  hour: number,
  minute: number,
  sequence = 0
) => {
  const shifted = addMonths(anchorDate, monthOffset);
  const monthStart = startOfMonth(shifted);
  const maxDayInMonth = endOfMonth(shifted).getDate();
  const maxDayForCurrentMonth =
    monthOffset === 0 ? Math.max(1, anchorDate.getDate()) : maxDayInMonth;
  const safeDay = Math.min(day, Math.min(maxDayInMonth, maxDayForCurrentMonth));
  const adjustedDay =
    monthOffset === 0 && day > maxDayForCurrentMonth
      ? Math.max(1, safeDay - (sequence % 4))
      : safeDay;

  return set(monthStart, {
    date: adjustedDay,
    hours: hour,
    minutes: minute,
    seconds: 0,
    milliseconds: 0,
  });
};

const createSeedTransaction = (
  anchorDate: Date,
  monthOffset: number,
  day: number,
  hour: number,
  minute: number,
  sequence: number,
  userId: string,
  currency: string,
  data: Omit<SeedTransaction, "date" | "currency" | "userId">
): SeedTransaction => ({
  ...data,
  currency,
  userId,
  date: getMonthDate(anchorDate, monthOffset, day, hour, minute, sequence).toISOString(),
});

const buildRecurringTransactions = (
  anchorDate: Date,
  monthOffset: number,
  userId: string,
  currency: string,
  options: {
    category: string;
    tag: string;
    days: number[];
    hour: number;
    minute: number;
    titles: string[];
    descriptions: string[];
    amounts: number[];
    multiplier?: number;
  }
) => {
  const multiplier = options.multiplier || 1;
  return options.days.map((day, index) =>
    createSeedTransaction(
      anchorDate,
      monthOffset,
      day,
      options.hour,
      options.minute + (index % 3) * 7,
      index,
      userId,
      currency,
      {
        amount: toNumber(options.amounts[index % options.amounts.length] * multiplier),
        category: options.category,
        tag: options.tag,
        title: options.titles[index % options.titles.length],
        description: options.descriptions[index % options.descriptions.length],
      }
    )
  );
};

const buildMonthlyExpenses = (
  anchorDate: Date,
  monthOffset: number,
  userId: string,
  currency: string
) => {
  const multiplier = monthOffset === 0 ? 1.08 : monthOffset === -1 ? 0.96 : 0.9;

  const food = buildRecurringTransactions(anchorDate, monthOffset, userId, currency, {
    category: "food",
    tag: "meals",
    days: [1, 2, 4, 5, 7, 9, 11, 13, 16, 20, 23, 27],
    hour: 13,
    minute: 10,
    titles: [
      "Lunch and coffee",
      "Groceries refill",
      "Dinner after work",
      "Weekly grocery run",
    ],
    descriptions: [
      "Quick lunch and coffee between meetings.",
      "Groceries for the week including fruits and snacks.",
      "Dinner delivery after a late work day.",
      "Supermarket run for home essentials.",
    ],
    amounts: [320, 460, 820, 1450, 620, 980],
    multiplier,
  });

  const transport = buildRecurringTransactions(
    anchorDate,
    monthOffset,
    userId,
    currency,
    {
      category: "transportation",
      tag: "commute",
      days: [1, 3, 6, 8, 10, 14, 18, 22, 26],
      hour: 9,
      minute: 25,
      titles: ["Metro and cab", "Office commute", "Ride share"],
      descriptions: [
        "Mixed metro and cab commute across the city.",
        "Regular office commute and return trip.",
        "Ride-share for client meetings and errands.",
      ],
      amounts: [190, 240, 310, 420, 260],
      multiplier,
    }
  );

  const extras: SeedTransaction[] = [
    createSeedTransaction(anchorDate, monthOffset, 1, 8, 30, 1, userId, currency, {
      amount: toNumber(28000 * multiplier),
      category: "housing",
      tag: "rent",
      title: "Apartment rent",
      description: "Monthly apartment rent payment.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 2, 10, 45, 2, userId, currency, {
      amount: toNumber(2850 * multiplier),
      category: "utilities",
      tag: "electricity",
      title: "Electricity bill",
      description: "Electricity bill payment for the month.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 3, 11, 10, 3, userId, currency, {
      amount: toNumber(1299 * multiplier),
      category: "utilities",
      tag: "internet",
      title: "Internet plan",
      description: "Fiber internet bill for home office work.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 4, 12, 15, 4, userId, currency, {
      amount: toNumber(4200 * multiplier),
      category: "insurance",
      tag: "health",
      title: "Health insurance premium",
      description: "Monthly health insurance payment.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 5, 8, 50, 5, userId, currency, {
      amount: toNumber(8000 * multiplier),
      category: "investments",
      tag: "sip",
      title: "Index fund SIP",
      description: "Monthly index fund SIP investment.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 5, 19, 5, 6, userId, currency, {
      amount: toNumber(5000 * multiplier),
      category: "savings",
      tag: "buffer",
      title: "Emergency fund contribution",
      description: "Transfer to the emergency savings buffer.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 6, 17, 15, 7, userId, currency, {
      amount: toNumber(2650 * multiplier),
      category: "business",
      tag: "software",
      title: "Software subscriptions",
      description: "Design, note-taking, and cloud tools for freelance work.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 8, 18, 20, 8, userId, currency, {
      amount: toNumber(1750 * multiplier),
      category: "personal",
      tag: "grooming",
      title: "Grooming and self-care",
      description: "Haircut and grooming essentials.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 10, 16, 35, 9, userId, currency, {
      amount: toNumber(2350 * multiplier),
      category: "healthcare",
      tag: "checkup",
      title: "Doctor visit",
      description: "Routine health checkup and prescriptions.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 12, 20, 10, 10, userId, currency, {
      amount: toNumber((monthOffset === 0 ? 9200 : 5600) * multiplier),
      category: "entertainment",
      tag: "events",
      title: monthOffset === 0 ? "Concert night" : "Weekend event",
      description:
        monthOffset === 0
          ? "Concert tickets and late dinner with friends."
          : "Movie night, snacks, and a long weekend activity.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 15, 7, 55, 11, userId, currency, {
      amount: toNumber((monthOffset === 0 ? 11800 : 4200) * multiplier),
      category: "travel",
      tag: "trip",
      title: monthOffset === 0 ? "Weekend getaway" : "Intercity train tickets",
      description:
        monthOffset === 0
          ? "Quick weekend getaway with train tickets and hotel deposit."
          : "Train tickets and local travel for a family visit.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 18, 11, 30, 12, userId, currency, {
      amount: toNumber(3600 * multiplier),
      category: "education",
      tag: "learning",
      title: "Course and books",
      description: "Online course renewal and a few technical books.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 21, 14, 40, 13, userId, currency, {
      amount: toNumber(2200 * multiplier),
      category: "other",
      tag: "family",
      title: "Family gifting",
      description: "Gift and courier charges for family.",
    }),
  ];

  return [...food, ...transport, ...extras].sort((left, right) =>
    left.date.localeCompare(right.date)
  );
};

const buildMonthlyIncomes = (
  anchorDate: Date,
  monthOffset: number,
  userId: string,
  currency: string
) => {
  const multiplier = monthOffset === 0 ? 1.05 : monthOffset === -1 ? 1 : 0.95;

  const incomeEntries: SeedTransaction[] = [
    createSeedTransaction(anchorDate, monthOffset, 1, 10, 0, 1, userId, currency, {
      amount: roundToHundred(180000 * multiplier),
      category: "salary",
      tag: "salary",
      title: "Monthly salary",
      description: "Primary salary credited for the month.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 9, 15, 20, 2, userId, currency, {
      amount: roundToHundred((monthOffset === 0 ? 32000 : 22000) * multiplier),
      category: "freelance",
      tag: "consulting",
      title: "Freelance consulting payout",
      description: "Product strategy consulting payment from a side client.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 18, 12, 10, 3, userId, currency, {
      amount: roundToHundred(2400 * multiplier),
      category: "interest",
      tag: "dividend",
      title: "Dividend and interest",
      description: "Dividend payout and savings account interest.",
    }),
    createSeedTransaction(anchorDate, monthOffset, 24, 18, 35, 4, userId, currency, {
      amount: roundToHundred((monthOffset === 0 ? 14000 : 9000) * multiplier),
      category: "sidehustle",
      tag: "creator",
      title: "Side project revenue",
      description: "Income from a weekend side project and workshops.",
    }),
  ];

  return incomeEntries.sort((left, right) => left.date.localeCompare(right.date));
};

const summarizeCategoryTotals = (
  expenses: SeedTransaction[],
  monthStart: Date,
  monthEnd: Date
) =>
  expenses.reduce<Record<string, number>>((accumulator, expense) => {
    const expenseDate = new Date(expense.date);

    if (!isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })) {
      return accumulator;
    }

    accumulator[expense.category] =
      (accumulator[expense.category] || 0) + expense.amount;
    return accumulator;
  }, {});

const buildBudgetFromSummary = ({
  monthStart,
  monthEnd,
  summary,
  userId,
  currency,
  title,
  description,
  totalMultiplier,
  categoryMultiplier,
  omitCategories = [],
}: {
  monthStart: Date;
  monthEnd: Date;
  summary: Record<string, number>;
  userId: string;
  currency: string;
  title: string;
  description: string;
  totalMultiplier: number;
  categoryMultiplier: Partial<Record<string, number>>;
  omitCategories?: string[];
}): SeedBudget => {
  const totalSpent = Object.values(summary).reduce((sum, value) => sum + value, 0);
  const budget: SeedBudget = {
    title,
    description,
    userId,
    currency,
    amount: roundToHundred(totalSpent * totalMultiplier),
    startingDate: monthStart.toISOString(),
    endDate: monthEnd.toISOString(),
  };

  Object.entries(summary).forEach(([category, total]) => {
    if (!total || omitCategories.includes(category)) return;

    const multiplier = categoryMultiplier[category] ?? 1.12;
    budget[category as keyof SeedBudget] = roundToHundred(total * multiplier) as never;
  });

  return budget;
};

const buildDemoBudgets = (
  anchorDate: Date,
  userId: string,
  currency: string,
  expenses: SeedTransaction[]
) => {
  const currentStart = startOfMonth(anchorDate);
  const currentEnd = endOfMonth(anchorDate);
  const previousStart = startOfMonth(subMonths(anchorDate, 1));
  const previousEnd = endOfMonth(subMonths(anchorDate, 1));
  const earlierStart = startOfMonth(subMonths(anchorDate, 2));
  const earlierEnd = endOfMonth(subMonths(anchorDate, 2));
  const nextStart = startOfMonth(addMonths(anchorDate, 1));
  const nextEnd = endOfMonth(addMonths(anchorDate, 1));

  const currentSummary = summarizeCategoryTotals(expenses, currentStart, currentEnd);
  const previousSummary = summarizeCategoryTotals(expenses, previousStart, previousEnd);
  const earlierSummary = summarizeCategoryTotals(expenses, earlierStart, earlierEnd);

  const currentBudget = buildBudgetFromSummary({
    monthStart: currentStart,
    monthEnd: currentEnd,
    summary: currentSummary,
    userId,
    currency,
    title: `${format(currentStart, "MMMM")} Demo Budget`,
    description:
      "Current month showcase budget with a few deliberate overruns and missing category allocations.",
    totalMultiplier: 0.9,
    categoryMultiplier: {
      housing: 1.04,
      food: 1.15,
      entertainment: 0.64,
      personal: 0.75,
      transportation: 1.02,
      healthcare: 1.12,
      utilities: 1.08,
      business: 1.06,
      education: 1.1,
      insurance: 1.05,
      savings: 1,
      investments: 1,
    },
    omitCategories: ["travel", "other"],
  });

  const previousBudget = buildBudgetFromSummary({
    monthStart: previousStart,
    monthEnd: previousEnd,
    summary: previousSummary,
    userId,
    currency,
    title: `${format(previousStart, "MMMM")} Demo Budget`,
    description:
      "Previous month budget tuned to show a healthy, mostly on-track story.",
    totalMultiplier: 1.15,
    categoryMultiplier: {
      entertainment: 1.05,
      travel: 1.2,
      other: 1.15,
    },
  });

  const earlierBudget = buildBudgetFromSummary({
    monthStart: earlierStart,
    monthEnd: earlierEnd,
    summary: earlierSummary,
    userId,
    currency,
    title: `${format(earlierStart, "MMMM")} Demo Budget`,
    description:
      "Earlier month budget used to make historical trend and archive views feel populated.",
    totalMultiplier: 1.12,
    categoryMultiplier: {},
  });

  const nextBudget = buildBudgetFromSummary({
    monthStart: nextStart,
    monthEnd: nextEnd,
    summary: currentSummary,
    userId,
    currency,
    title: `${format(nextStart, "MMMM")} Demo Budget`,
    description:
      "Forward-looking budget draft for the next month, helpful for budget list status previews.",
    totalMultiplier: 0.98,
    categoryMultiplier: {
      entertainment: 0.8,
      travel: 0.85,
      housing: 1.02,
      food: 1.05,
      business: 1.1,
    },
  });

  return [currentBudget, previousBudget, earlierBudget, nextBudget];
};

export const generateDemoSeed = ({
  userId,
  currency = DEMO_DEFAULTS.currency,
  anchorDate = new Date(),
}: ResetDemoDataParams) => {
  const expenses = [
    ...buildMonthlyExpenses(anchorDate, -2, userId, currency),
    ...buildMonthlyExpenses(anchorDate, -1, userId, currency),
    ...buildMonthlyExpenses(anchorDate, 0, userId, currency),
  ];

  const incomes = [
    ...buildMonthlyIncomes(anchorDate, -2, userId, currency),
    ...buildMonthlyIncomes(anchorDate, -1, userId, currency),
    ...buildMonthlyIncomes(anchorDate, 0, userId, currency),
  ];

  const budgets = buildDemoBudgets(anchorDate, userId, currency, expenses);

  return { expenses, incomes, budgets };
};

const wipeCollection = async (collectionId: string, userId: string) => {
  while (true) {
    const response = await database.listDocuments(ENVS.DB_ID, collectionId, [
      Query.equal("userId", userId),
      Query.limit(100),
    ]);

    if (!response.documents.length) break;

    await Promise.all(
      response.documents.map((document: Models.Document) =>
        database.deleteDocument(ENVS.DB_ID, collectionId, document.$id)
      )
    );
  }
};

const createDocumentsInBatches = async (
  collectionId: string,
  userId: string,
  documents: Array<Record<string, unknown>>
) => {
  const permissions = getDocumentPermissions(userId);
  const batchSize = 8;

  for (let index = 0; index < documents.length; index += batchSize) {
    const batch = documents.slice(index, index + batchSize);
    await Promise.all(
      batch.map((document) =>
        database.createDocument(
          ENVS.DB_ID,
          collectionId,
          ID.unique(),
          document,
          permissions
        )
      )
    );
  }
};

export const resetDemoData = async ({
  userId,
  currency = DEMO_DEFAULTS.currency,
  anchorDate = new Date(),
}: ResetDemoDataParams): Promise<ResetDemoDataResult> => {
  const nextSeed = generateDemoSeed({ userId, currency, anchorDate });

  await wipeCollection(ENVS.COLLECTIONS.EXPENSES, userId);
  await wipeCollection(ENVS.COLLECTIONS.INCOMES, userId);
  await wipeCollection(ENVS.COLLECTIONS.BUDGETS, userId);

  await createDocumentsInBatches(
    ENVS.COLLECTIONS.EXPENSES,
    userId,
    nextSeed.expenses
  );
  await createDocumentsInBatches(
    ENVS.COLLECTIONS.INCOMES,
    userId,
    nextSeed.incomes
  );
  await createDocumentsInBatches(
    ENVS.COLLECTIONS.BUDGETS,
    userId,
    nextSeed.budgets
  );

  return {
    expenses: nextSeed.expenses.length,
    incomes: nextSeed.incomes.length,
    budgets: nextSeed.budgets.length,
    seedKey: getDemoSeedKey(anchorDate),
  };
};

export const ensureCurrentDemoSeed = async ({
  userId,
  currency = DEMO_DEFAULTS.currency,
  anchorDate = new Date(),
}: ResetDemoDataParams): Promise<ResetDemoDataResult> => {
  const nextSeedKey = getDemoSeedKey(anchorDate);
  const storedSeedKey = getStoredDemoSeedKey();

  if (storedSeedKey === nextSeedKey) {
    return {
      expenses: 0,
      incomes: 0,
      budgets: 0,
      seedKey: nextSeedKey,
    };
  }

  if (activeDemoSeedPromise && activeDemoSeedKey === nextSeedKey) {
    return activeDemoSeedPromise;
  }

  activeDemoSeedKey = nextSeedKey;
  activeDemoSeedPromise = resetDemoData({
    userId,
    currency,
    anchorDate,
  }).then((result) => {
    setStoredDemoSeedKey(result.seedKey);
    return result;
  });

  try {
    return await activeDemoSeedPromise;
  } finally {
    activeDemoSeedPromise = null;
    activeDemoSeedKey = null;
  }
};

const signOutCurrentSessionIfPresent = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    // ignore
  }
};

const setDemoPrefs = async () => {
  try {
    await account.updatePrefs({
      currency: DEMO_DEFAULTS.currency,
    });
  } catch (error) {
    // ignore
  }
};

export const ensureDemoAccount = async (): Promise<EnsureDemoAccountResult> => {
  await signOutCurrentSessionIfPresent();

  try {
    const session = await account.createEmailSession(
      DEMO_DEFAULTS.email,
      DEMO_DEFAULTS.password
    );
    localStorage.setItem("sessionId", session.$id);
    await setDemoPrefs();
    const userInfo = await account.get();
    return { session, userInfo, created: false };
  } catch (error) {
    const appwriteError = error as AppwriteException;
    if (appwriteError?.code !== 401) {
      throw error;
    }
  }

  let created = false;
  try {
    await account.create(
      ID.unique(),
      DEMO_DEFAULTS.email,
      DEMO_DEFAULTS.password,
      DEMO_DEFAULTS.name
    );
    created = true;
  } catch (error) {
    const appwriteError = error as AppwriteException;
    if (appwriteError?.code !== 409) {
      throw error;
    }
  }

  const session = await account.createEmailSession(
    DEMO_DEFAULTS.email,
    DEMO_DEFAULTS.password
  );
  localStorage.setItem("sessionId", session.$id);
  await setDemoPrefs();
  const userInfo = await account.get();

  return { session, userInfo, created };
};

export const getDemoSplitwisePayload = (
  anchorDate = new Date()
): SplitwiseApiSyncResponse => {
  const currentMonthDate = getMonthDate(anchorDate, 0, 6, 19, 10, 1).toISOString();
  const currentMonthDateTwo = getMonthDate(anchorDate, 0, 11, 14, 5, 2).toISOString();
  const previousMonthDate = getMonthDate(anchorDate, -1, 23, 18, 45, 3).toISOString();

  const payload: SplitwisePayload = {
    expenses: [
      {
        id: "demo-1",
        description: "Goa planning advance",
        cost: "7600.00",
        currency_code: DEMO_DEFAULTS.currency,
        date: currentMonthDate,
        created_at: currentMonthDate,
        created_by: {
          id: "1001",
          first_name: "Demo",
          last_name: "User",
        },
        category: {
          id: "travel",
          name: "Travel",
        },
        users: [
          {
            user_id: "1001",
            paid_share: "7600.00",
            owed_share: "2533.33",
            net_balance: "5066.67",
            user: {
              id: "1001",
              first_name: "Demo",
              last_name: "User",
            },
          },
          {
            user_id: "2002",
            paid_share: "0.00",
            owed_share: "2533.33",
            net_balance: "-2533.33",
            user: {
              id: "2002",
              first_name: "Aarav",
              last_name: "Shah",
            },
          },
          {
            user_id: "2003",
            paid_share: "0.00",
            owed_share: "2533.34",
            net_balance: "-2533.34",
            user: {
              id: "2003",
              first_name: "Rhea",
              last_name: "Kapoor",
            },
          },
        ],
      },
      {
        id: "demo-2",
        description: "Team dinner split",
        cost: "2400.00",
        currency_code: DEMO_DEFAULTS.currency,
        date: currentMonthDateTwo,
        created_at: currentMonthDateTwo,
        created_by: {
          id: "2002",
          first_name: "Aarav",
          last_name: "Shah",
        },
        category: {
          id: "food",
          name: "Food",
        },
        users: [
          {
            user_id: "1001",
            paid_share: "0.00",
            owed_share: "800.00",
            net_balance: "-800.00",
            user: {
              id: "1001",
              first_name: "Demo",
              last_name: "User",
            },
          },
          {
            user_id: "2002",
            paid_share: "2400.00",
            owed_share: "800.00",
            net_balance: "1600.00",
            user: {
              id: "2002",
              first_name: "Aarav",
              last_name: "Shah",
            },
          },
          {
            user_id: "2003",
            paid_share: "0.00",
            owed_share: "800.00",
            net_balance: "-800.00",
            user: {
              id: "2003",
              first_name: "Rhea",
              last_name: "Kapoor",
            },
          },
        ],
      },
      {
        id: "demo-3",
        description: "Cab back from airport",
        cost: "1180.00",
        currency_code: DEMO_DEFAULTS.currency,
        date: previousMonthDate,
        created_at: previousMonthDate,
        created_by: {
          id: "1001",
          first_name: "Demo",
          last_name: "User",
        },
        category: {
          id: "transport",
          name: "Transportation",
        },
        users: [
          {
            user_id: "1001",
            paid_share: "1180.00",
            owed_share: "590.00",
            net_balance: "590.00",
            user: {
              id: "1001",
              first_name: "Demo",
              last_name: "User",
            },
          },
          {
            user_id: "2004",
            paid_share: "0.00",
            owed_share: "590.00",
            net_balance: "-590.00",
            user: {
              id: "2004",
              first_name: "Kabir",
              last_name: "Mehta",
            },
          },
        ],
      },
    ],
  };

  return {
    source: "demo_payload",
    fetchedAt: new Date().toISOString(),
    expensesCount: payload.expenses.length,
    user: {
      id: "1001",
      displayName: "Demo User",
      email: DEMO_DEFAULTS.email,
    },
    payload,
  };
};
