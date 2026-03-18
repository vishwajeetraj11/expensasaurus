import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Layout from "expensasaurus/components/layout/Layout";
import { Models, Role } from "appwrite";
import { useQueryClient } from "react-query";
import { categories, incomeCategories } from "expensasaurus/shared/constants/categories";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { API_ROUTES } from "expensasaurus/shared/constants/routes";
import { ASSISTANT_NOT_AVAILABLE_MESSAGE } from "expensasaurus/shared/constants/assistantAccess";
import { ID, Permission, account, database } from "expensasaurus/shared/services/appwrite";
import {
  AssistantAccessStatus,
  fetchAssistantAccessStatus,
} from "expensasaurus/shared/services/assistantAccess";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import AssistantView from "expensasaurus/features/assistant/AssistantView";
import {
  DEMO_ASSISTANT_PROMPTS,
  isDemoModeEnabled,
  isDemoUser,
} from "expensasaurus/shared/demo";
import {
  applyDraftDefaults,
  applyDraftDefaultsToItems,
  buildContextMessages,
  canSaveDraft,
  createId,
  fileToBase64,
  initialMessage,
  resolveDraftType,
} from "expensasaurus/features/assistant/helpers";
import {
  AssistantMessage,
  ParsedExpense,
  StreamEvent,
} from "expensasaurus/features/assistant/types";

const AssistantPage = () => {
  const { user, userInfo, getUserInfo } = useAuthStore((state) => ({
    user: state.user,
    userInfo: state.userInfo,
    getUserInfo: state.getUserInfo,
  })) as {
    user: Models.Session | null;
    userInfo: Models.User<Models.Preferences> | null;
    getUserInfo: () => Promise<void>;
  };
  const assistantCurrency = useMemo(() => {
    const preferredCurrency = userInfo?.prefs?.currency;
    if (typeof preferredCurrency === "string" && preferredCurrency.trim()) {
      return preferredCurrency.trim().toUpperCase();
    }
    return "INR";
  }, [userInfo?.prefs?.currency]);
  const suggestedPrompts = useMemo(
    () =>
      isDemoModeEnabled() && isDemoUser(userInfo)
        ? [...DEMO_ASSISTANT_PROMPTS]
        : [],
    [userInfo]
  );

  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<AssistantMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [savingDraftKey, setSavingDraftKey] = useState<string | null>(null);
  const [pendingDateChange, setPendingDateChange] = useState<{
    messageId: string;
    draft: ParsedExpense;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assistantAccess, setAssistantAccess] =
    useState<AssistantAccessStatus | null>(null);
  const [isAccessLoading, setIsAccessLoading] = useState(true);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

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
    if (user && !userInfo) {
      getUserInfo();
    }
  }, [user, userInfo, getUserInfo]);

  useEffect(() => {
    let isCancelled = false;

    if (!user) {
      setAssistantAccess(null);
      setIsAccessLoading(false);
      return;
    }

    const loadAssistantAccess = async () => {
      setIsAccessLoading(true);
      try {
        const nextStatus = await fetchAssistantAccessStatus();
        if (!isCancelled) {
          setAssistantAccess(nextStatus);
        }
      } catch (accessError) {
        if (!isCancelled) {
          setAssistantAccess({
            enabledForEveryone: false,
            canUseAssistant: false,
            isAdmin: false,
            updatedAt: null,
            updatedBy: null,
            message:
              accessError instanceof Error
                ? accessError.message
                : ASSISTANT_NOT_AVAILABLE_MESSAGE,
          });
        }
      } finally {
        if (!isCancelled) {
          setIsAccessLoading(false);
        }
      }
    };

    loadAssistantAccess();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const canAccessAssistant = assistantAccess?.canUseAssistant ?? false;
  const assistantBlockedMessage =
    assistantAccess?.message || ASSISTANT_NOT_AVAILABLE_MESSAGE;

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

  const updateMessage = (
    messageId: string,
    updater: (message: AssistantMessage) => AssistantMessage
  ) => {
    setMessages((prev) =>
      prev.map((message) => (message.id === messageId ? updater(message) : message))
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

  const normalizeDraft = (draft: ParsedExpense) => {
    const type = resolveDraftType(draft);
    const categoryMap =
      type === "income" ? incomeCategoryKeyMap : expenseCategoryKeyMap;
    const normalizedCategory = draft.category
      ? categoryMap.get(draft.category.toLowerCase()) || draft.category
      : "other";

    const currency = assistantCurrency;
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
          "Sure - what date should I use? You can say something like \"today\", \"yesterday\", or \"Feb 5, 2026\".",
      },
    ]);
  };

  const getDraftSaveKey = (messageId: string, itemIndex?: number) =>
    `${messageId}:${typeof itemIndex === "number" ? itemIndex : "single"}`;

  const handleSaveDraft = async (
    draft: ParsedExpense,
    messageId: string,
    itemIndex?: number
  ) => {
    if (!user?.userId) {
      appendAssistantMessage("Please log in again to save this entry.");
      return;
    }

    if (!canSaveDraft(draft, assistantCurrency)) {
      appendAssistantMessage("Missing required fields. Please complete the draft.");
      return;
    }

    const payload = normalizeDraft(draft);
    const type = resolveDraftType(draft);
    const collectionId =
      type === "income" ? ENVS.COLLECTIONS.INCOMES : ENVS.COLLECTIONS.EXPENSES;
    setSavingDraftKey(getDraftSaveKey(messageId, itemIndex));

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
          const nextIds = message.savedItemIds ? [...message.savedItemIds] : [];
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
      setSavingDraftKey(null);
    }
  };

  const sendMessage = async (options: {
    displayText: string;
    requestText?: string;
    imageFile?: File | null;
    imagePreview?: string | null;
  }) => {
    if (!options.displayText.trim() && !options.imageFile) return false;
    if (isAccessLoading) {
      setError("Checking assistant availability...");
      return false;
    }
    if (!canAccessAssistant) {
      setError(assistantBlockedMessage);
      return false;
    }

    setError(null);

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
        messages: { role: "user" | "assistant"; text: string }[];
        stream: boolean;
      } = {
        text: options.requestText || userMessage.text || "",
        messages: buildContextMessages(messages, initialMessage.id),
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

      const jwt = (await account.createJWT()).jwt;
      const response = await fetch(API_ROUTES.ASSISTANT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        let message = "Assistant request failed.";
        try {
          const errorPayload = await response.json();
          if (typeof errorPayload?.reply === "string") {
            message = errorPayload.reply;
          }
        } catch (parseError) {
          // ignore non-json error payloads
        }
        throw new Error(message);
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
            parsed: applyDraftDefaults(event.parsed, assistantCurrency),
            items: applyDraftDefaultsToItems(event.items, assistantCurrency),
            missing: event.missing,
          }));
        }

        if (event.type === "final") {
          updateMessage(assistantId, (message) => ({
            ...message,
            text: event.reply || message.text,
            parsed: applyDraftDefaults(event.parsed, assistantCurrency),
            items: applyDraftDefaultsToItems(event.items, assistantCurrency),
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

    return true;
  };

  const onSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() && !imageFile) return;
    const userInput = input.trim();

    if (pendingDateChange) {
      const previousPendingDateChange = pendingDateChange;
      const dateUpdateRequest = [
        "Update only the date for the following draft entry.",
        `User input date: ${userInput}`,
        `Current draft: ${JSON.stringify(previousPendingDateChange.draft)}`,
      ].join("\n");

      setPendingDateChange(null);
      setInput("");
      const sent = await sendMessage({
        displayText: userInput,
        requestText: dateUpdateRequest,
      });
      if (!sent) {
        setInput(userInput);
        setPendingDateChange(previousPendingDateChange);
      }
      return;
    }

    const previousImageFile = imageFile;
    const previousImagePreview = imagePreview;
    setInput("");
    resetAttachment();
    const sent = await sendMessage({
      displayText: userInput,
      imageFile,
      imagePreview,
    });
    if (!sent) {
      setInput(userInput);
      setImageFile(previousImageFile);
      setImagePreview(previousImagePreview);
    }
  };

  return (
    <Layout disablePadding>
      <Head>
        <title>Expensasaurus - Assistant</title>
      </Head>
      {isAccessLoading ? (
        <div className="mx-auto w-full max-w-[920px] px-4 pb-8 pt-6 sm:pb-16">
          <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-8 text-center shadow-[0_25px_70px_-45px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-navy-900/70">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Assistant
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Checking assistant availability...
            </p>
          </div>
        </div>
      ) : !canAccessAssistant ? (
        <div className="mx-auto w-full max-w-[920px] px-4 pb-8 pt-6 sm:pb-16">
          <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-navy-900/70">
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              Assistant rollout
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Assistant
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {assistantBlockedMessage}
            </p>
          </div>
        </div>
      ) : (
      <AssistantView
        messages={messages}
        isStreaming={isStreaming}
        scrollAnchorRef={scrollAnchorRef}
        onSend={onSend}
        input={input}
        setInput={setInput}
        pendingDateChange={pendingDateChange}
        setPendingDateChange={setPendingDateChange}
        imageFile={imageFile}
        onPickImage={onPickImage}
        resetAttachment={resetAttachment}
        isSending={isSending}
        error={error}
        handleSaveDraft={handleSaveDraft}
        savingDraftKey={savingDraftKey}
        requestDateChange={requestDateChange}
        defaultCurrency={assistantCurrency}
        suggestedPrompts={suggestedPrompts}
      />
      )}
    </Layout>
  );
};

export default AssistantPage;
