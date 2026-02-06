import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Layout from "expensasaurus/components/layout/Layout";
import { Models, Role } from "appwrite";
import { useQueryClient } from "react-query";
import { categories, incomeCategories } from "expensasaurus/shared/constants/categories";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { API_ROUTES, ROUTES } from "expensasaurus/shared/constants/routes";
import { isAssistantEmailAllowed } from "expensasaurus/shared/constants/assistantAccess";
import { ID, Permission, account, database } from "expensasaurus/shared/services/appwrite";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { useRouter } from "next/router";
import AssistantView from "expensasaurus/features/assistant/AssistantView";
import {
  applyDraftDefaults,
  applyDraftDefaultsToItems,
  buildContextMessages,
  canSaveDraft,
  createId,
  fileToBase64,
  getSpeechRecognition,
  initialMessage,
  resolveDraftType,
} from "expensasaurus/features/assistant/helpers";
import {
  AssistantMessage,
  ParsedExpense,
  SpeechRecognitionEventLike,
  SpeechRecognitionInstance,
  StreamEvent,
} from "expensasaurus/features/assistant/types";

const AssistantPage = () => {
  const router = useRouter();
  const { user, userInfo, getUserInfo } = useAuthStore((state) => ({
    user: state.user,
    userInfo: state.userInfo,
    getUserInfo: state.getUserInfo,
  })) as {
    user: Models.Session | null;
    userInfo: Models.User<Models.Preferences> | null;
    getUserInfo: () => Promise<void>;
  };
  const canAccessAssistant = isAssistantEmailAllowed(userInfo?.email);

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
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptBaseRef = useRef("");
  const timerRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);

  const waveformHeights = useMemo(
    () => Array.from({ length: 26 }, () => 8 + Math.floor(Math.random() * 18)),
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
    if (user && !userInfo) {
      getUserInfo();
    }
  }, [user, userInfo, getUserInfo]);

  useEffect(() => {
    if (userInfo && !canAccessAssistant) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [userInfo, canAccessAssistant, router]);

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

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
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
          "Sure - what date should I use? You can say something like \"today\", \"yesterday\", or \"Feb 5, 2026\".",
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
      setSavingMessageId(null);
    }
  };

  const sendMessage = async (options: {
    displayText: string;
    requestText?: string;
    imageFile?: File | null;
    imagePreview?: string | null;
  }) => {
    if (!options.displayText.trim() && !options.imageFile) return;
    if (!canAccessAssistant) {
      setError("Assistant is restricted for this account.");
      return;
    }

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

  return (
    <Layout disablePadding>
      <Head>
        <title>Expensasaurus - Assistant</title>
      </Head>
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
        isRecording={isRecording}
        speechSupported={speechSupported}
        startRecording={startRecording}
        stopRecording={stopRecording}
        waveformHeights={waveformHeights}
        audioDuration={audioDuration}
        isTranscribing={isTranscribing}
        isSending={isSending}
        error={error}
        audioError={audioError}
        handleSaveDraft={handleSaveDraft}
        savingMessageId={savingMessageId}
        requestDateChange={requestDateChange}
      />
    </Layout>
  );
};

export default AssistantPage;
