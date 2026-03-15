import type { NextApiRequest, NextApiResponse } from "next";
import type { SplitwiseApiSyncResponse } from "expensasaurus/features/splitwise/types";
import {
  ASSISTANT_ALLOWED_EMAIL,
  getBearerToken,
  normalizeEmail,
  verifyAuthenticatedUser,
} from "expensasaurus/server/assistant/auth";
import {
  getAllSplitwiseExpenses,
  getSplitwiseCurrentUser,
} from "expensasaurus/server/splitwise/client";

const SPLITWISE_ALLOWED_EMAIL =
  process.env.SPLITWISE_ALLOWED_EMAIL || ASSISTANT_ALLOWED_EMAIL;

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SplitwiseApiSyncResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const token = getBearerToken(req);
  const authenticatedUser = await verifyAuthenticatedUser(token);
  if (!authenticatedUser) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (
    SPLITWISE_ALLOWED_EMAIL &&
    normalizeEmail(authenticatedUser.email) !== normalizeEmail(SPLITWISE_ALLOWED_EMAIL)
  ) {
    return res
      .status(403)
      .json({ error: "Splitwise sync is restricted for this account." });
  }

  const apiKey = process.env.SPLITWISE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing SPLITWISE_API_KEY on the server. Add it to enable Splitwise sync.",
    });
  }

  try {
    const [user, payload] = await Promise.all([
      getSplitwiseCurrentUser(apiKey),
      getAllSplitwiseExpenses(apiKey),
    ]);

    res.setHeader("Cache-Control", "private, no-store, max-age=0");

    return res.status(200).json({
      source: "splitwise_api",
      fetchedAt: new Date().toISOString(),
      expensesCount: payload.expenses.length,
      user,
      payload,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch Splitwise data right now.";
    return res.status(502).json({ error: message });
  }
}
