import { Account, Client } from "appwrite";
import type { NextApiRequest } from "next";
import {
  ASSISTANT_ADMIN_EMAILS,
  isAssistantAdminEmail,
} from "expensasaurus/shared/constants/assistantAccess";
import { AuthenticatedUser } from "./types";
import { readAssistantAccessSettings } from "./settings";

export const ASSISTANT_ALLOWED_EMAIL = ASSISTANT_ADMIN_EMAILS[0];
export const DEMO_ALLOWED_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@admin.io";
export const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const normalizeEmail = (email?: string | null) =>
  (email || "").trim().toLowerCase();

export const isAssistantServerEmailAllowed = (email?: string | null) => {
  const normalized = normalizeEmail(email);

  if (normalized === normalizeEmail(ASSISTANT_ALLOWED_EMAIL)) {
    return true;
  }

  return DEMO_MODE_ENABLED && normalized === normalizeEmail(DEMO_ALLOWED_EMAIL);
};

export const getAssistantAccessState = async (email?: string | null) => {
  const settings = await readAssistantAccessSettings();
  const isAdmin = isAssistantAdminEmail(email);

  return {
    ...settings,
    isAdmin,
    canUseAssistant: isAdmin || settings.enabledForEveryone,
  };
};

export const getClientIp = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length) {
    return String(forwarded[0]).trim();
  }
  return req.socket?.remoteAddress || "unknown";
};

export const getBearerToken = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
};

export const verifyAuthenticatedUser = async (
  token: string | null
): Promise<AuthenticatedUser | null> => {
  if (!token) return null;

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!endpoint || !projectId) return null;

  try {
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setJWT(token);
    const account = new Account(client);
    const user = await account.get();
    const prefs = user?.prefs as Record<string, unknown> | undefined;
    const preferredCurrency =
      typeof prefs?.currency === "string" ? prefs.currency : undefined;

    return {
      userId: user.$id,
      email: user.email,
      preferredCurrency,
    };
  } catch (error) {
    return null;
  }
};
