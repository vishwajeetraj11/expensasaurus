import type { NextApiRequest, NextApiResponse } from "next";
import {
  ASSISTANT_NOT_AVAILABLE_MESSAGE,
  isAssistantAdminEmail,
} from "expensasaurus/shared/constants/assistantAccess";
import {
  getAssistantAccessState,
  getBearerToken,
  verifyAuthenticatedUser,
} from "expensasaurus/server/assistant/auth";
import { writeAssistantAccessSettings } from "expensasaurus/server/assistant/settings";

type AssistantAccessResponse = {
  enabledForEveryone: boolean;
  canUseAssistant: boolean;
  isAdmin: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AssistantAccessResponse | { message: string }>
) {
  const token = getBearerToken(req);
  const authenticatedUser = await verifyAuthenticatedUser(token);

  if (!authenticatedUser) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  if (req.method === "GET") {
    const state = await getAssistantAccessState(authenticatedUser.email);

    return res.status(200).json({
      ...state,
      message: state.canUseAssistant
        ? undefined
        : ASSISTANT_NOT_AVAILABLE_MESSAGE,
    });
  }

  if (req.method === "POST") {
    if (!isAssistantAdminEmail(authenticatedUser.email)) {
      return res.status(403).json({ message: "Only admin can update assistant access." });
    }

    if (typeof req.body?.enabledForEveryone !== "boolean") {
      return res
        .status(400)
        .json({ message: "enabledForEveryone must be a boolean." });
    }

    const settings = await writeAssistantAccessSettings({
      enabledForEveryone: req.body.enabledForEveryone,
      updatedAt: new Date().toISOString(),
      updatedBy: authenticatedUser.email || null,
    });

    return res.status(200).json({
      ...settings,
      isAdmin: true,
      canUseAssistant: true,
    });
  }

  return res.status(405).json({ message: "Method not allowed." });
}
