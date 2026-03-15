import {
  AssistantMessage,
  ContextMessage,
  ParsedExpense,
  SpeechRecognitionConstructor,
  SpeechRecognitionWindow,
} from "./types";

export const initialMessage = {
  id: "assistant-welcome",
  role: "assistant" as const,
  text:
    "Tell me an expense or income in plain language or drop a receipt image. I will draft the details so you can confirm.",
};

export const MAX_CONTEXT_MESSAGES = 8;

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getTodayIso = () => new Date().toISOString().split("T")[0];

export const resolveDraftType = (draft?: ParsedExpense) =>
  draft?.type === "income" ? "income" : "expense";

const resolveCurrency = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase();
  return normalized || "INR";
};

export const canSaveDraft = (
  draft?: ParsedExpense,
  requiredCurrency = "INR"
) => {
  if (!draft) return false;
  const amountValue =
    typeof draft.amount === "number" ? draft.amount : Number(draft.amount);
  const resolvedRequiredCurrency = resolveCurrency(requiredCurrency);
  const resolvedDraftCurrency = draft.currency
    ? resolveCurrency(draft.currency)
    : resolvedRequiredCurrency;

  return Boolean(
    draft.title &&
      Number.isFinite(amountValue) &&
      draft.category &&
      (draft.date || getTodayIso()) &&
      resolvedDraftCurrency &&
      resolvedDraftCurrency === resolvedRequiredCurrency
  );
};

export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

export const applyDraftDefaults = (
  draft?: ParsedExpense,
  defaultCurrency = "INR"
): ParsedExpense | undefined => {
  if (!draft) return draft;
  const todayIso = getTodayIso();
  const resolvedCurrency = resolveCurrency(defaultCurrency);
  return {
    ...draft,
    type: draft.type === "income" ? "income" : "expense",
    date: draft.date || todayIso,
    currency: draft.currency ? resolveCurrency(draft.currency) : resolvedCurrency,
  };
};

export const applyDraftDefaultsToItems = (
  items?: ParsedExpense[],
  defaultCurrency = "INR"
) => {
  if (!items) return items;
  return items.map((item) => applyDraftDefaults(item, defaultCurrency) || item);
};

export const buildContextMessages = (
  history: AssistantMessage[],
  initialMessageId: string
) => {
  const context = history
    .filter((message) => message.id !== initialMessageId)
    .map((message) => {
      const hasStructuredDraft = Boolean(
        (message.parsed && Object.keys(message.parsed).length) ||
          (message.items && message.items.length)
      );
      const parts: string[] = [];

      if (message.text) {
        parts.push(message.text);
      }

      if (message.role === "assistant" && hasStructuredDraft) {
        parts.push(
          `Structured draft context: ${JSON.stringify({
            parsed: message.parsed,
            items: message.items,
            missing: message.missing,
          })}`
        );
      }

      return {
        role: message.role,
        text: parts.join("\n"),
      };
    })
    .filter((message) => Boolean(message.text.trim())) as ContextMessage[];

  if (context.length <= MAX_CONTEXT_MESSAGES) return context;
  return context.slice(-MAX_CONTEXT_MESSAGES);
};

export const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechRecognitionWindow;
  return (
    speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null
  );
};
