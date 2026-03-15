import {
  SplitwiseAnalysisResult,
  SplitwiseCurrencyTotal,
  SplitwiseExpense,
  SplitwiseNetDirection,
  SplitwiseNormalizedRow,
  SplitwiseParticipantOption,
  SplitwisePayload,
  SplitwiseUserProfile,
  SplitwiseUserShare,
} from "./types";

const DATE_PREFIX_REGEX = /^\d{4}-\d{2}-\d{2}/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const coerceNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const normalizeCurrencyCode = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return "INR";
  }

  return value.trim().toUpperCase();
};

const buildDisplayName = (user?: SplitwiseUserProfile | null) => {
  if (!user) return "Unknown";

  const firstName = typeof user.first_name === "string" ? user.first_name.trim() : "";
  const lastName = typeof user.last_name === "string" ? user.last_name.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || "Unknown";
};

const normalizeDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return { date: null, sortTimestamp: 0 };
  }

  const trimmed = value.trim();
  const prefixMatch = trimmed.match(DATE_PREFIX_REGEX);
  if (prefixMatch?.[0]) {
    const date = prefixMatch[0];
    const sortTimestamp = Date.parse(`${date}T00:00:00Z`);
    return {
      date,
      sortTimestamp: Number.isFinite(sortTimestamp) ? sortTimestamp : 0,
    };
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return { date: null, sortTimestamp: 0 };
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;

  return {
    date,
    sortTimestamp: Date.parse(`${date}T00:00:00Z`),
  };
};

const toExpense = (value: unknown): SplitwiseExpense => {
  if (!isRecord(value)) {
    return {};
  }

  return value as unknown as SplitwiseExpense;
};

const toUserShare = (value: unknown): SplitwiseUserShare | null => {
  if (!isRecord(value)) return null;
  return value as unknown as SplitwiseUserShare;
};

const isUserShare = (value: SplitwiseUserShare | null): value is SplitwiseUserShare =>
  value !== null;

const getCounterparties = (
  users: SplitwiseUserShare[],
  viewerUserId: string,
  involvesMe: boolean
) => {
  const participants = users
    .filter((user) => {
      const userId = user.user_id == null ? "" : String(user.user_id);
      return involvesMe ? userId !== viewerUserId : true;
    })
    .map((user) => buildDisplayName(user.user))
    .filter(Boolean);

  return participants.length ? participants : ["Only me"];
};

const getDirection = (
  involvesMe: boolean,
  netBalance: number | null
): SplitwiseNetDirection => {
  if (!involvesMe) return "not_involving_me";
  if (netBalance === null || netBalance === 0) return "settled";
  return netBalance > 0 ? "positive" : "negative";
};

const buildNormalizedRow = (
  expense: SplitwiseExpense,
  viewerUserId: string
): SplitwiseNormalizedRow => {
  const users = Array.isArray(expense.users)
    ? expense.users.map(toUserShare).filter(isUserShare)
    : [];
  const viewerUser = users.find((user) => String(user?.user_id ?? "") === viewerUserId);
  const involvesMe = Boolean(viewerUser);

  const paidShare = coerceNumber(viewerUser?.paid_share);
  const owedShare = coerceNumber(viewerUser?.owed_share);
  const netBalance =
    coerceNumber(viewerUser?.net_balance) ??
    (paidShare !== null && owedShare !== null ? paidShare - owedShare : null);

  const primaryDate = normalizeDate(expense.date ?? expense.created_at);
  const fullCost = coerceNumber(expense.cost);
  const validationErrors: string[] = [];

  if (fullCost === null) {
    validationErrors.push("Invalid full cost");
  }
  if (!primaryDate.date) {
    validationErrors.push("Invalid date");
  }
  if (involvesMe && paidShare === null) {
    validationErrors.push("Invalid paid share");
  }
  if (involvesMe && owedShare === null) {
    validationErrors.push("Invalid owed share");
  }
  if (involvesMe && netBalance === null) {
    validationErrors.push("Invalid net balance");
  }

  const description =
    typeof expense.description === "string" && expense.description.trim()
      ? expense.description.trim()
      : "Untitled expense";

  return {
    splitwiseExpenseId:
      expense.id == null || expense.id === "" ? "unknown" : String(expense.id),
    description,
    date: primaryDate.date,
    sortTimestamp: primaryDate.sortTimestamp,
    fullCost,
    currencyCode: normalizeCurrencyCode(expense.currency_code),
    splitwiseCategory:
      typeof expense.category?.name === "string" && expense.category.name.trim()
        ? expense.category.name.trim()
        : "Uncategorized",
    myPaidShare: paidShare,
    myOwedShare: owedShare,
    myNetBalance: netBalance,
    netDirection: getDirection(involvesMe, netBalance),
    counterparties: getCounterparties(users, viewerUserId, involvesMe),
    createdByName: buildDisplayName(expense.created_by),
    involvesMe,
    isValid: validationErrors.length === 0,
    validationErrors,
    rawExpense: expense,
  };
};

const sumCurrencyTotals = (
  rows: SplitwiseNormalizedRow[],
  selector: (row: SplitwiseNormalizedRow) => number | null
) => {
  const totals = new Map<string, number>();

  rows.forEach((row) => {
    const amount = selector(row);
    if (amount === null || !Number.isFinite(amount)) return;

    const current = totals.get(row.currencyCode) || 0;
    totals.set(row.currencyCode, current + amount);
  });

  return Array.from(totals.entries())
    .map(
      ([currencyCode, total]): SplitwiseCurrencyTotal => ({
        currencyCode,
        total,
      })
    )
    .sort((left, right) => left.currencyCode.localeCompare(right.currencyCode));
};

const buildSummary = (rows: SplitwiseNormalizedRow[]) => {
  const involvingMeRows = rows.filter((row) => row.involvesMe);

  return {
    totalRowsParsed: rows.length,
    rowsInvolvingMe: involvingMeRows.length,
    settledCount: rows.filter((row) => row.netDirection === "settled").length,
    notInvolvingMeCount: rows.filter((row) => row.netDirection === "not_involving_me")
      .length,
    invalidRowCount: rows.filter((row) => !row.isValid).length,
    fullCostTotals: sumCurrencyTotals(rows, (row) => row.fullCost),
    positiveNetTotals: sumCurrencyTotals(
      rows.filter((row) => row.netDirection === "positive"),
      (row) => row.myNetBalance
    ),
    negativeNetTotals: sumCurrencyTotals(
      rows.filter((row) => row.netDirection === "negative"),
      (row) => (row.myNetBalance === null ? null : Math.abs(row.myNetBalance))
    ),
  };
};

const collectParticipants = (expenses: SplitwiseExpense[]) => {
  const participants = new Map<string, SplitwiseParticipantOption>();

  expenses.forEach((expense) => {
    const users = Array.isArray(expense.users)
      ? expense.users.map(toUserShare).filter(isUserShare)
      : [];

    users.forEach((user) => {
      const userId = user.user_id == null ? "" : String(user.user_id);
      if (!userId) return;

      const existing = participants.get(userId);
      const displayName = buildDisplayName(user.user);
      if (existing) {
        existing.occurrenceCount += 1;
        if (existing.displayName === "Unknown" && displayName !== "Unknown") {
          existing.displayName = displayName;
        }
        return;
      }

      participants.set(userId, {
        userId,
        displayName,
        occurrenceCount: 1,
      });
    });
  });

  return Array.from(participants.values()).sort((left, right) => {
    const occurrenceDelta = right.occurrenceCount - left.occurrenceCount;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    return left.displayName.localeCompare(right.displayName);
  });
};

export const parseSplitwisePayload = (rawJson: string): SplitwisePayload => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    throw new Error("Invalid JSON. Paste a valid Splitwise payload.");
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.expenses)) {
    throw new Error(
      'Invalid Splitwise payload. Expected an object with an "expenses" array.'
    );
  }

  return {
    expenses: parsed.expenses.map(toExpense),
  };
};

export const analyzeSplitwisePayload = (options: {
  rawJson: string;
  viewerUserId?: string;
}): SplitwiseAnalysisResult => {
  const viewerUserId = options.viewerUserId?.trim() || "";
  const payload = parseSplitwisePayload(options.rawJson);
  const participants = collectParticipants(payload.expenses);
  const rows = payload.expenses
    .map((expense) => buildNormalizedRow(expense, viewerUserId))
    .sort((left, right) => right.sortTimestamp - left.sortTimestamp);

  return {
    viewerUserId,
    hasViewerSelection: Boolean(viewerUserId),
    participants,
    rows,
    summary: buildSummary(rows),
  };
};
