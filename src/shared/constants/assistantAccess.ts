const ASSISTANT_ALLOWED_EMAILS = ["vishwajeetraj11@gmail.com"] as const;

const normalizeEmail = (email?: string | null) =>
  (email || "").trim().toLowerCase();

export const isAssistantEmailAllowed = (email?: string | null) =>
  ASSISTANT_ALLOWED_EMAILS.includes(
    normalizeEmail(email) as (typeof ASSISTANT_ALLOWED_EMAILS)[number]
  );

export { ASSISTANT_ALLOWED_EMAILS };
