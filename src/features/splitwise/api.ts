import { account } from "expensasaurus/shared/services/appwrite";
import { API_ROUTES } from "expensasaurus/shared/constants/routes";
import { SplitwiseApiSyncResponse } from "./types";

type SplitwiseApiErrorResponse = {
  error?: string;
};

export const fetchSplitwisePayloadFromApi = async () => {
  const jwt = (await account.createJWT()).jwt;
  const response = await fetch(API_ROUTES.SPLITWISE, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const payload = (await response.json()) as
    | SplitwiseApiSyncResponse
    | SplitwiseApiErrorResponse;

  if (!response.ok) {
    const errorMessage =
      "error" in payload && typeof payload.error === "string" && payload.error.trim()
        ? payload.error.trim()
        : "Unable to fetch Splitwise data.";

    throw new Error(
      errorMessage
    );
  }

  return payload as SplitwiseApiSyncResponse;
};
