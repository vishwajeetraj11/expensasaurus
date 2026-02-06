import {
  MicrophoneIcon,
  PaperClipIcon,
  SparklesIcon,
  XIcon,
} from "@heroicons/react/solid";
import Link from "next/link";
import React from "react";
import { clsx } from "expensasaurus/shared/utils/common";
import { AssistantMessage, ParsedExpense } from "./types";
import { canSaveDraft, formatTime, resolveDraftType } from "./helpers";

type Props = {
  messages: AssistantMessage[];
  isStreaming: boolean;
  scrollAnchorRef: React.RefObject<HTMLDivElement>;
  onSend: (event: React.FormEvent) => Promise<void>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  pendingDateChange: { messageId: string; draft: ParsedExpense } | null;
  setPendingDateChange: React.Dispatch<
    React.SetStateAction<{ messageId: string; draft: ParsedExpense } | null>
  >;
  imageFile: File | null;
  onPickImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetAttachment: () => void;
  isRecording: boolean;
  speechSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  waveformHeights: number[];
  audioDuration: number;
  isTranscribing: boolean;
  isSending: boolean;
  error: string | null;
  audioError: string | null;
  handleSaveDraft: (
    draft: ParsedExpense,
    messageId: string,
    itemIndex?: number
  ) => Promise<void>;
  savingMessageId: string | null;
  requestDateChange: (messageId: string, draft?: ParsedExpense) => void;
};

const AssistantView = ({
  messages,
  isStreaming,
  scrollAnchorRef,
  onSend,
  input,
  setInput,
  pendingDateChange,
  setPendingDateChange,
  imageFile,
  onPickImage,
  resetAttachment,
  isRecording,
  speechSupported,
  startRecording,
  stopRecording,
  waveformHeights,
  audioDuration,
  isTranscribing,
  isSending,
  error,
  audioError,
  handleSaveDraft,
  savingMessageId,
  requestDateChange,
}: Props) => {
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
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_10px_25px_-18px_rgba(29,78,216,0.8)] hover:from-blue-500 hover:to-blue-400"
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
    <div className="relative mx-auto w-full max-w-[1120px] px-4 pb-8 pt-3 sm:pb-16 sm:pt-6">
      <div className="relative mt-3 overflow-hidden rounded-[36px] border border-slate-200/60 bg-white/80 p-4 shadow-[0_35px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/70 dark:shadow-[0_35px_90px_-65px_rgba(2,6,23,0.95)] sm:mt-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),transparent_58%)]" />

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
                Session-only memory
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Messages, images, and audio are not stored.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] bg-gradient-to-br from-slate-200/70 via-white/90 to-slate-200/70 p-[1px] shadow-[0_20px_60px_-40px_rgba(15,23,42,0.5)] dark:from-white/10 dark:via-navy-700/90 dark:to-white/10 sm:mt-8">
          <div className="overflow-hidden rounded-[27px] bg-white/80 backdrop-blur dark:bg-navy-900/75">
            <div className="max-h-[62vh] space-y-5 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.7))] px-4 py-6 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.7))] sm:px-6">
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
                          AI is typing...
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
                      {message.parsed &&
                        !message.items?.length &&
                        renderDraftCard(message.parsed, message)}
                    </div>
                  </div>
                );
              })}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-[18px] bg-white px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200/70 shadow-sm dark:bg-navy-700/80 dark:text-slate-300 dark:ring-white/10">
                    AI is typing...
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
                        Updating date for the last draft. Type a date like
                        {" "}&quot;today&quot;, &quot;yesterday&quot;, or &quot;Feb 5, 2026&quot;.
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
                    className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-none outline-none transition placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-navy-900/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-white/30 dark:focus:ring-white/10"
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
                            "inline-flex appearance-none items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors duration-150",
                            speechSupported
                              ? "border-blue-200/80 bg-blue-50/85 text-blue-700 shadow-[0_12px_26px_-22px_rgba(37,99,235,0.75)] hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-400/35 dark:bg-blue-500/22 dark:text-blue-100 dark:shadow-[0_10px_25px_-22px_rgba(37,99,235,0.85)] dark:hover:border-blue-300/70 dark:hover:bg-blue-500/32 dark:hover:text-white"
                              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-100 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-400 dark:opacity-100"
                          )}
                        >
                          <MicrophoneIcon className="h-4 w-4" />
                          {speechSupported ? "Record" : "Voice unavailable"}
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
                          : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 shadow-[0_12px_30px_-18px_rgba(29,78,216,0.8)] hover:from-blue-500 hover:via-blue-500 hover:to-blue-400 dark:from-blue-500 dark:via-blue-500 dark:to-blue-400 dark:text-white dark:hover:from-blue-400 dark:hover:via-blue-400 dark:hover:to-blue-300"
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
                  {error && <p className="text-xs text-rose-500">{error}</p>}
                  {audioError && <p className="text-xs text-rose-500">{audioError}</p>}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantView;
