export const ASSISTANT_ADMIN_EMAILS = ["vishwajeetraj11@gmail.com"] as const;
export const ASSISTANT_ALLOWED_EMAILS = ASSISTANT_ADMIN_EMAILS;
export const ASSISTANT_NOT_AVAILABLE_MESSAGE =
  "Assistant is not allowed to everyone yet.";

export const normalizeAssistantEmail = (email?: string | null) =>
  (email || "").trim().toLowerCase();

export const isAssistantAdminEmail = (email?: string | null) => {
  const normalizedEmail = normalizeAssistantEmail(email);

  return ASSISTANT_ADMIN_EMAILS.some(
    (allowedEmail) => normalizeAssistantEmail(allowedEmail) === normalizedEmail
  );
};

export const isAssistantEmailAllowed = (email?: string | null) =>
  isAssistantAdminEmail(email);
