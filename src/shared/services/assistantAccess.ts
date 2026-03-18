import { API_ROUTES } from "expensasaurus/shared/constants/routes";
import { account } from "expensasaurus/shared/services/appwrite";

export type AssistantAccessStatus = {
  enabledForEveryone: boolean;
  canUseAssistant: boolean;
  isAdmin: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
  message?: string;
};

const createAssistantAuthHeaders = async () => {
  const jwt = (await account.createJWT()).jwt;

  return {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  };
};

const readAssistantAccessResponse = async (response: Response) => {
  const payload = await response.json();

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Unable to load assistant access.";
    throw new Error(message);
  }

  return payload as AssistantAccessStatus;
};

export const fetchAssistantAccessStatus = async () => {
  const response = await fetch(API_ROUTES.ASSISTANT_ACCESS, {
    method: "GET",
    headers: await createAssistantAuthHeaders(),
  });

  return readAssistantAccessResponse(response);
};

export const updateAssistantAccessStatus = async (
  enabledForEveryone: boolean
) => {
  const response = await fetch(API_ROUTES.ASSISTANT_ACCESS, {
    method: "POST",
    headers: await createAssistantAuthHeaders(),
    body: JSON.stringify({ enabledForEveryone }),
  });

  return readAssistantAccessResponse(response);
};
