import { ContextMessage, ParsedExpense, SpeechRecognitionConstructor, SpeechRecognitionWindow } from "./types";

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

export const canSaveDraft = (draft?: ParsedExpense) => {
  if (!draft) return false;
  const amountValue =
    typeof draft.amount === "number" ? draft.amount : Number(draft.amount);
  return Boolean(
    draft.title &&
      Number.isFinite(amountValue) &&
      draft.category &&
      (draft.date || getTodayIso()) &&
      (draft.currency || "INR")
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
  draft?: ParsedExpense
): ParsedExpense | undefined => {
  if (!draft) return draft;
  const todayIso = getTodayIso();
  return {
    ...draft,
    type: draft.type === "income" ? "income" : "expense",
    date: draft.date || todayIso,
    currency: draft.currency || "INR",
  };
};

export const applyDraftDefaultsToItems = (items?: ParsedExpense[]) => {
  if (!items) return items;
  return items.map((item) => applyDraftDefaults(item) || item);
};

export const buildContextMessages = (
  history: Array<{ id: string; role: "user" | "assistant"; text?: string }>,
  initialMessageId: string
) => {
  const context = history
    .filter(
      (message) =>
        message.text &&
        (message.role === "user" || message.role === "assistant") &&
        message.id !== initialMessageId
    )
    .map((message) => ({
      role: message.role,
      text: message.text || "",
    })) as ContextMessage[];

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
