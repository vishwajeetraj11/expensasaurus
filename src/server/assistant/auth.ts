import { Account, Client } from "appwrite";
import type { NextApiRequest } from "next";
import { AuthenticatedUser } from "./types";

export const ASSISTANT_ALLOWED_EMAIL = "vishwajeetraj11@gmail.com";

export const normalizeEmail = (email?: string | null) =>
  (email || "").trim().toLowerCase();

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

    return {
      userId: user.$id,
      email: user.email,
    };
  } catch (error) {
    return null;
  }
};
