import {
  SplitwiseCurrentUser,
  SplitwiseExpense,
  SplitwisePayload,
  SplitwiseUserProfile,
} from "expensasaurus/features/splitwise/types";

const SPLITWISE_API_BASE_URL = "https://secure.splitwise.com/api/v3.0";
const SPLITWISE_PAGE_SIZE = 100;
const SPLITWISE_MAX_PAGES = 50;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const buildDisplayName = (user?: SplitwiseUserProfile | null) => {
  if (!user) return "Unknown";

  const firstName = typeof user.first_name === "string" ? user.first_name.trim() : "";
  const lastName = typeof user.last_name === "string" ? user.last_name.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || "Unknown";
};

const readSplitwiseError = async (response: Response) => {
  try {
    const payload = await response.json();
    if (isRecord(payload)) {
      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error.trim();
      }

      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        const firstError = payload.errors.find(
          (value) => typeof value === "string" && value.trim()
        );
        if (typeof firstError === "string") {
          return firstError.trim();
        }
      }
    }
  } catch (error) {
    // Ignore non-JSON error bodies and fall through to the generic message.
  }

  return `Splitwise request failed with status ${response.status}.`;
};

const createSplitwiseRequestUrl = (
  path: string,
  searchParams?: Record<string, string>
) => {
  const url = new URL(`${SPLITWISE_API_BASE_URL}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
};

const fetchSplitwise = async <T>(
  apiKey: string,
  path: string,
  searchParams?: Record<string, string>
): Promise<T> => {
  const response = await fetch(createSplitwiseRequestUrl(path, searchParams), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readSplitwiseError(response));
  }

  return (await response.json()) as T;
};

export const getSplitwiseCurrentUser = async (apiKey: string) => {
  const response = await fetchSplitwise<{ user?: SplitwiseUserProfile | null }>(
    apiKey,
    "/get_current_user"
  );

  const user = response?.user;
  const userId = user?.id == null ? "" : String(user.id);

  if (!userId) {
    throw new Error("Splitwise did not return a current user.");
  }

  const currentUser: SplitwiseCurrentUser = {
    id: userId,
    displayName: buildDisplayName(user),
    email: typeof user?.email === "string" ? user.email : null,
  };

  return currentUser;
};

export const getAllSplitwiseExpenses = async (apiKey: string): Promise<SplitwisePayload> => {
  const expenses: SplitwiseExpense[] = [];

  for (let page = 0; page < SPLITWISE_MAX_PAGES; page += 1) {
    const offset = page * SPLITWISE_PAGE_SIZE;
    const response = await fetchSplitwise<{ expenses?: unknown }>(apiKey, "/get_expenses", {
      limit: String(SPLITWISE_PAGE_SIZE),
      offset: String(offset),
    });

    const batch = Array.isArray(response?.expenses) ? response.expenses : [];
    expenses.push(...batch.filter(isRecord).map((expense) => expense as SplitwiseExpense));

    if (batch.length < SPLITWISE_PAGE_SIZE) {
      break;
    }
  }

  return { expenses };
};
