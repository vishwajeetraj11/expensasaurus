import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "expensasaurus/components/layout/Layout";
import { clsx } from "expensasaurus/shared/utils/common";
import { MicrophoneIcon, PaperClipIcon, SparklesIcon, XIcon } from "@heroicons/react/solid";
import { Models, Role } from "appwrite";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { categories, incomeCategories } from "expensasaurus/shared/constants/categories";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { ID, Permission, database } from "expensasaurus/shared/services/appwrite";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  imageUrl?: string;
  parsed?: ParsedExpense;
  items?: ParsedExpense[];
  missing?: string[];
  status?: "streaming" | "done";
  savedId?: string;
  savedItemIds?: string[];
};

type ParsedExpense = {
  type?: "expense" | "income";
  amount?: number;
  currency?: string;
  date?: string;
  category?: string;
  title?: string;
  description?: string;
  tag?: string;
};

type ContextMessage = {
  role: "user" | "assistant";
  text: string;
};

type StreamEvent = {
  type: "reply_delta" | "draft" | "done" | "error" | "final";
  delta?: string;
  reply?: string;
  parsed?: ParsedExpense;
  items?: ParsedExpense[];
  missing?: string[];
  message?: string;
};

const initialMessage: AssistantMessage = {
  id: "assistant-welcome",
  role: "assistant",
  text:
    "Tell me an expense or income in plain language or drop a receipt image. I will draft the details so you can confirm.",
};

const MAX_CONTEXT_MESSAGES = 8;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const AssistantPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user })) as {
    user: Models.Session | null;
  };
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<AssistantMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const [pendingDateChange, setPendingDateChange] = useState<{
    messageId: string;
    draft: ParsedExpense;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const transcriptBaseRef = useRef("");
  const timerRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);

  const waveformHeights = useMemo(
    () =>
      Array.from({ length: 26 }, () => 8 + Math.floor(Math.random() * 18)),
    []
  );
  const expenseCategoryKeyMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => {
      map.set(category.category.toLowerCase(), category.key);
      map.set(category.key.toLowerCase(), category.key);
    });
    return map;
  }, []);
  const incomeCategoryKeyMap = useMemo(() => {
    const map = new Map<string, string>();
    incomeCategories.forEach((category) => {
      map.set(category.category.toLowerCase(), category.key);
      map.set(category.key.toLowerCase(), category.key);
    });
    return map;
  }, []);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognition());
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      try {
        speechRecognitionRef.current?.stop();
      } catch (err) {
        // ignore invalid stop when recognition is inactive
      }
    };
  }, []);

  const resetAttachment = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onPickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;
    const anyWindow = window as any;
    return anyWindow.SpeechRecognition || anyWindow.webkitSpeechRecognition || null;
  };

  const startTranscription = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setAudioError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    transcriptBaseRef.current = input.trim();
    setIsTranscribing(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const chunk = result?.[0]?.transcript || "";
        if (result.isFinal) {
          finalTranscript += chunk;
        } else {
          interimTranscript += chunk;
        }
      }

      const combined = [transcriptBaseRef.current, finalTranscript, interimTranscript]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      setInput(combined);
    };

    recognition.onerror = () => {
      setAudioError("Could not capture speech. Check microphone permissions.");
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      setIsTranscribing(false);
    };

    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      setAudioError("Could not start speech recognition.");
      setIsTranscribing(false);
    }
  };

  const stopTranscription = () => {
    try {
      speechRecognitionRef.current?.stop();
    } catch (err) {
      // ignore invalid stop
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = () => {
    if (isRecording) return;
    setAudioError(null);

    if (!speechSupported) {
      setAudioError("Voice input is not supported in this browser.");
      return;
    }

    setIsRecording(true);
    startTranscription();
    recordingSecondsRef.current = 0;
    setAudioDuration(0);

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      recordingSecondsRef.current += 1;
      setAudioDuration(recordingSecondsRef.current);
    }, 1000);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    stopTranscription();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const updateMessage = (
    messageId: string,
    updater: (message: AssistantMessage) => AssistantMessage
  ) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? updater(message) : message
      )
    );
  };

  const appendAssistantMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        text,
      },
    ]);
  };

  const buildContextMessages = (history: AssistantMessage[]) => {
    const context = history
      .filter(
        (message) =>
          message.text &&
          (message.role === "user" || message.role === "assistant") &&
          message.id !== initialMessage.id
      )
      .map((message) => ({
        role: message.role,
        text: message.text || "",
      })) as ContextMessage[];

    if (context.length <= MAX_CONTEXT_MESSAGES) return context;
    return context.slice(-MAX_CONTEXT_MESSAGES);
  };

  const getTodayIso = () => new Date().toISOString().split("T")[0];

  const resolveDraftType = (draft?: ParsedExpense) =>
    draft?.type === "income" ? "income" : "expense";

  const canSaveDraft = (draft?: ParsedExpense) => {
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

  const normalizeDraft = (draft: ParsedExpense) => {
    const type = resolveDraftType(draft);
    const categoryMap =
      type === "income" ? incomeCategoryKeyMap : expenseCategoryKeyMap;
    const normalizedCategory = draft.category
      ? categoryMap.get(draft.category.toLowerCase()) || draft.category
      : "other";

    const currency = draft.currency || "INR";
    const dateValue = draft.date ? new Date(draft.date) : new Date();
    const isoDate = Number.isNaN(dateValue.getTime())
      ? new Date().toISOString()
      : dateValue.toISOString();

    const amountValue =
      typeof draft.amount === "number" ? draft.amount : Number(draft.amount);

    return {
      title: draft.title || (type === "income" ? "Income" : "Expense"),
      description:
        draft.description ||
        draft.title ||
        (type === "income" ? "AI income entry" : "AI expense entry"),
      amount: Number.isFinite(amountValue) ? amountValue : 0,
      category: normalizedCategory,
      tag: draft.tag || normalizedCategory,
      date: isoDate,
      currency,
    };
  };

  const requestDateChange = (messageId: string, draft?: ParsedExpense) => {
    if (!draft) return;
    setPendingDateChange({ messageId, draft });
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        text:
          "Sure — what date should I use? You can say something like “today”, “yesterday”, or “Feb 5, 2026”.",
      },
    ]);
  };

  const handleSaveDraft = async (
    draft: ParsedExpense,
    messageId: string,
    itemIndex?: number
  ) => {
    if (!user?.userId) {
      appendAssistantMessage("Please log in again to save this entry.");
      return;
    }

    if (!canSaveDraft(draft)) {
      appendAssistantMessage("Missing required fields. Please complete the draft.");
      return;
    }

    const payload = normalizeDraft(draft);
    const type = resolveDraftType(draft);
    const collectionId =
      type === "income" ? ENVS.COLLECTIONS.INCOMES : ENVS.COLLECTIONS.EXPENSES;
    setSavingMessageId(messageId);

    try {
      const permissionsArray = [
        Permission.read(Role.user(user.userId)),
        Permission.update(Role.user(user.userId)),
        Permission.delete(Role.user(user.userId)),
      ];

      const document = await database.createDocument(
        ENVS.DB_ID,
        collectionId,
        ID.unique(),
        {
          ...payload,
          userId: user.userId,
        },
        permissionsArray
      );

      updateMessage(messageId, (message) => {
        if (typeof itemIndex === "number") {
          const nextIds = message.savedItemIds
            ? [...message.savedItemIds]
            : [];
          nextIds[itemIndex] = document.$id;
          return { ...message, savedItemIds: nextIds };
        }
        return { ...message, savedId: document.$id };
      });

      queryClient.invalidateQueries(["Expenses"]);
      queryClient.invalidateQueries(["Incomes"]);
      appendAssistantMessage(
        type === "income" ? "Saved your income." : "Saved your expense."
      );
    } catch (err) {
      appendAssistantMessage(
        type === "income"
          ? "Saving income failed. Please try again."
          : "Saving expense failed. Please try again."
      );
    } finally {
      setSavingMessageId(null);
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });

  const applyDraftDefaults = (draft?: ParsedExpense): ParsedExpense | undefined => {
    if (!draft) return draft;
    const todayIso = getTodayIso();
    return {
      ...draft,
      type: draft.type === "income" ? "income" : "expense",
      date: draft.date || todayIso,
      currency: draft.currency || "INR",
    };
  };

  const applyDraftDefaultsToItems = (items?: ParsedExpense[]) => {
    if (!items) return items;
    return items.map((item) => applyDraftDefaults(item) || item);
  };

  const sendMessage = async (options: {
    displayText: string;
    requestText?: string;
    imageFile?: File | null;
    imagePreview?: string | null;
  }) => {
    if (!options.displayText.trim() && !options.imageFile) return;

    setError(null);
    setAudioError(null);

    const userMessage: AssistantMessage = {
      id: createId(),
      role: "user",
      text: options.displayText.trim() || undefined,
      imageUrl: options.imagePreview || undefined,
    };

    const assistantId = createId();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", status: "streaming" },
    ]);
    setIsSending(true);
    setIsStreaming(true);

    try {
      const payload: {
        text: string;
        image?: { data: string; name: string; type: string };
        messages: ContextMessage[];
        stream: boolean;
      } = {
        text: options.requestText || userMessage.text || "",
        messages: buildContextMessages(messages),
        stream: true,
      };

      if (options.imageFile) {
        const base64 = await fileToBase64(options.imageFile);
        payload.image = {
          data: base64,
          name: options.imageFile.name,
          type: options.imageFile.type,
        };
      }

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error("Assistant request failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleEvent = (event: StreamEvent) => {
        if (event.type === "reply_delta" && event.delta) {
          updateMessage(assistantId, (message) => ({
            ...message,
            text: `${message.text || ""}${event.delta}`,
          }));
        }

        if (event.type === "draft") {
          updateMessage(assistantId, (message) => ({
            ...message,
            text: event.reply || message.text,
            parsed: applyDraftDefaults(event.parsed),
            items: applyDraftDefaultsToItems(event.items),
            missing: event.missing,
          }));
        }

        if (event.type === "final") {
          updateMessage(assistantId, (message) => ({
            ...message,
            text: event.reply || message.text,
            parsed: applyDraftDefaults(event.parsed),
            items: applyDraftDefaultsToItems(event.items),
            missing: event.missing,
            status: "done",
          }));
          setIsStreaming(false);
        }

        if (event.type === "error") {
          updateMessage(assistantId, (message) => ({
            ...message,
            text: event.message || "Something went wrong while streaming.",
            status: "done",
          }));
          setIsStreaming(false);
        }

        if (event.type === "done") {
          updateMessage(assistantId, (message) => ({
            ...message,
            status: "done",
          }));
          setIsStreaming(false);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, "\n");

        let boundaryIndex = buffer.indexOf("\n\n");
        while (boundaryIndex !== -1) {
          const rawEvent = buffer.slice(0, boundaryIndex).trim();
          buffer = buffer.slice(boundaryIndex + 2);
          if (rawEvent) {
            const dataLines = rawEvent
              .split("\n")
              .filter((line) => line.startsWith("data:"));
            const data = dataLines
              .map((line) => line.replace(/^data:\s?/, ""))
              .join("\n")
              .trim();

            if (data) {
              try {
                const event = JSON.parse(data) as StreamEvent;
                handleEvent(event);
              } catch (err) {
                // Ignore malformed events
              }
            }
          }
          boundaryIndex = buffer.indexOf("\n\n");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      updateMessage(assistantId, (message) => ({
        ...message,
        text: "I ran into a problem processing that. Try again in a moment.",
        status: "done",
      }));
      setIsStreaming(false);
    } finally {
      setIsSending(false);
      setIsStreaming(false);
    }
  };

  const onSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() && !imageFile) return;
    const userInput = input.trim();

    if (pendingDateChange) {
      const dateUpdateRequest = [
        "Update only the date for the following draft entry.",
        `User input date: ${userInput}`,
        `Current draft: ${JSON.stringify(pendingDateChange.draft)}`,
      ].join("\n");

      setPendingDateChange(null);
      await sendMessage({
        displayText: userInput,
        requestText: dateUpdateRequest,
      });
      setInput("");
      return;
    }

    await sendMessage({
      displayText: userInput,
      imageFile,
      imagePreview,
    });
    setInput("");
    resetAttachment();
  };

  const renderDraftCard = (
    draft: ParsedExpense,
    message: AssistantMessage,
    itemIndex?: number
  ) => {
    const canSave = canSaveDraft(draft);
    const savedId =
      typeof itemIndex === "number"
        ? message.savedItemIds?.[itemIndex]
        : message.savedId;

    return (
      <div
        key={typeof itemIndex === "number" ? `${message.id}-${itemIndex}` : message.id}
        className="mt-4 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-[13px] text-slate-700 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-navy-900/60 dark:text-slate-200"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
          Draft {resolveDraftType(draft)}
          {typeof itemIndex === "number" ? ` ${itemIndex + 1}` : ""}
        </p>
        <div className="mt-2 grid gap-1">
          {draft.title && (
            <div>
              <span className="font-medium">Title:</span> {draft.title}
            </div>
          )}
          {draft.amount !== undefined && (
            <div>
              <span className="font-medium">Amount:</span> {draft.amount}{" "}
              {draft.currency || ""}
            </div>
          )}
          {draft.date && (
            <div>
              <span className="font-medium">Date:</span> {draft.date}
            </div>
          )}
          {draft.category && (
            <div>
              <span className="font-medium">Category:</span> {draft.category}
            </div>
          )}
          {draft.description && (
            <div>
              <span className="font-medium">Description:</span>{" "}
              {draft.description}
            </div>
          )}
          {draft.tag && (
            <div>
              <span className="font-medium">Tag:</span> {draft.tag}
            </div>
          )}
        </div>
        {message.missing && message.missing.length > 0 && (
          <p className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            Missing: {message.missing.join(", ")}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!canSave || savingMessageId === message.id}
            onClick={() => handleSaveDraft(draft, message.id, itemIndex)}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              canSave
                ? "bg-slate-900 text-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.8)] hover:bg-slate-800"
                : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
            )}
          >
            {savingMessageId === message.id
              ? "Saving..."
              : savedId
              ? "Saved"
              : "Confirm & Save"}
          </button>
          <button
            type="button"
            onClick={() => requestDateChange(message.id, draft)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
          >
            Change date
          </button>
          {savedId && (
            <Link
              href={
                resolveDraftType(draft) === "income"
                  ? `/incomes/${savedId}`
                  : `/expenses/${savedId}`
              }
              className="text-xs font-medium text-brand-500 hover:text-brand-600"
            >
              View {resolveDraftType(draft)}
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout disablePadding>
      <Head>
        <title>Expensasaurus - Assistant</title>
      </Head>
      <div className="relative mx-auto w-full max-w-[1120px] px-4 pb-4 pt-3 sm:pb-20 sm:pt-6">
        <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-emerald-200/30 blur-[120px]" />
        </div>
        <div className="relative mt-3 overflow-hidden rounded-[36px] border border-slate-200/60 bg-white/80 p-4 shadow-[0_35px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:mt-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),transparent_55%)]" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                  <SparklesIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" />
                  Smart finance assistant
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Assistant
                </h1>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Tell me an expense or income in plain language, or drop a receipt image.
                  I will draft the details so you can confirm.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Session‑only memory
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Messages, images, and audio are not stored.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] bg-gradient-to-br from-slate-200/70 via-white/90 to-slate-200/70 p-[1px] shadow-[0_20px_60px_-40px_rgba(15,23,42,0.5)] dark:from-white/10 dark:via-navy-800/80 dark:to-white/10 sm:mt-8">
            <div className="overflow-hidden rounded-[27px] bg-white/80 backdrop-blur dark:bg-navy-800/70">
              <div className="max-h-[62vh] space-y-5 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.7))] px-4 py-6 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.5),rgba(15,23,42,0.2))] sm:px-6">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={clsx("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={clsx(
                      "max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm backdrop-blur",
                      isUser
                        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-[0_12px_40px_-30px_rgba(15,23,42,0.75)]"
                        : "bg-white/90 text-slate-700 ring-1 ring-slate-200/70 dark:bg-navy-700/80 dark:text-slate-100 dark:ring-white/10"
                    )}
                  >
                    {message.text && <p>{message.text}</p>}
                    {!message.text && message.status === "streaming" && (
                      <p className="text-slate-500 dark:text-slate-300">
                        AI is typing…
                      </p>
                    )}
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Attachment preview"
                        className="mt-3 max-h-48 rounded-2xl border border-white/10 bg-white/70 p-2 shadow-sm object-contain"
                      />
                    )}
                    {message.items && message.items.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.items.map((item, index) =>
                          renderDraftCard(item, message, index)
                        )}
                      </div>
                    )}
                    {message.parsed && !message.items?.length && (
                      renderDraftCard(message.parsed, message)
                    )}
                  </div>
                </div>
              );
            })}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-[18px] bg-white text-xs text-slate-500 ring-1 ring-slate-200/70 px-3 py-2 shadow-sm">
                  AI is typing…
                </div>
              </div>
            )}
            <div ref={scrollAnchorRef} />
          </div>

          <form
            onSubmit={onSend}
            className="border-t border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-navy-900/60 sm:px-6 sm:py-5"
          >
            <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-3 shadow-none dark:border-white/10 dark:bg-navy-900/70 sm:p-4">
              <div className="flex flex-col gap-3">
              {pendingDateChange && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs font-medium text-amber-800 shadow-sm">
                  <span>
                    Updating date for the last draft. Type a date like “today”,
                    “yesterday”, or “Feb 5, 2026”.
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingDateChange(null)}
                    className="text-xs font-medium text-amber-700 hover:text-amber-900"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    onSend(event as unknown as React.FormEvent);
                  }
                }}
                placeholder="e.g. Spent $12.50 on coffee yesterday"
                className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-none outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-navy-900/60 dark:text-slate-100 dark:focus:border-white/30 dark:focus:ring-white/10"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-none transition hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickImage}
                    />
                    <PaperClipIcon className="h-4 w-4" />
                    Attach image
                  </label>
                  {imageFile && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {imageFile.name}
                    </span>
                  )}
                  {imageFile && (
                    <button
                      type="button"
                      onClick={resetAttachment}
                      className="inline-flex items-center rounded-full border border-rose-200 px-2 py-1 text-xs text-rose-500 hover:border-rose-300 hover:text-rose-600 dark:border-rose-500/40 dark:text-rose-300"
                    >
                      Remove
                    </button>
                  )}
                  {!isRecording && (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={!speechSupported}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1.5 text-xs font-medium shadow-none transition",
                        speechSupported
                          ? "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                          : "cursor-not-allowed border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-500"
                      )}
                    >
                      <MicrophoneIcon className="h-4 w-4" />
                      {speechSupported ? "Dictate" : "Voice unavailable"}
                    </button>
                  )}
                  <span className="inline-flex items-center rounded-full border border-slate-200/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                    Cmd/Ctrl + Enter
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={
                    isSending ||
                    isStreaming ||
                    isRecording ||
                    (!input.trim() && !imageFile)
                  }
                  className={clsx(
                    "inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-medium text-white transition",
                    isSending || isStreaming || isRecording || (!input.trim() && !imageFile)
                      ? "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                      : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.8)] hover:from-slate-800 hover:via-slate-800 hover:to-slate-600 dark:bg-white/10 dark:hover:bg-white/20"
                  )}
                >
                  Send
                </button>
              </div>
              {isRecording && (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-2 text-xs text-slate-600 shadow-none dark:border-white/10 dark:bg-navy-900/70 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 items-center gap-[3px]">
                      {waveformHeights.map((height, index) => (
                        <span
                          key={index}
                          className="w-[2px] rounded-full bg-slate-900/80 animate-pulse dark:bg-white/60"
                          style={{ height, animationDelay: `${index * 0.06}s` }}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-300">
                      {formatTime(audioDuration)}
                    </span>
                    {isTranscribing && (
                      <span className="ml-2 text-xs text-brand-500">
                        Listening...
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
              {error && (
                <p className="text-xs text-rose-500">
                  {error}
                </p>
              )}
              {audioError && (
                <p className="text-xs text-rose-500">
                  {audioError}
                </p>
              )}
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
      </div>
    </Layout>
  );
};

export default AssistantPage;
