import { format, parseISO } from "date-fns";
import React, { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import Button from "expensasaurus/components/ui/Button";
import ErrorMessage from "expensasaurus/components/ui/ErrorMessage";
import FormInputLabel from "expensasaurus/components/ui/FormInputLabel";
import TextArea from "expensasaurus/components/ui/TextArea";
import TextInput from "expensasaurus/components/ui/TextInput";
import {
  getDemoSplitwisePayload,
  isDemoModeEnabled,
} from "expensasaurus/shared/demo";
import { clsx } from "expensasaurus/shared/utils/common";
import {
  formatCompactCurrency,
  formatCurrency,
} from "expensasaurus/shared/utils/currency";
import { fetchSplitwisePayloadFromApi } from "./api";
import { analyzeSplitwisePayload } from "./analyzer";
import {
  SplitwiseAnalysisResult,
  SplitwiseApiSyncResponse,
  SplitwiseCurrencyTotal,
  SplitwiseFilterValue,
  SplitwiseNetDirection,
  SplitwiseNormalizedRow,
  SplitwiseParticipantOption,
} from "./types";

const FILTER_OPTIONS: Array<{
  value: SplitwiseFilterValue;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "positive", label: "Positive" },
  { value: "negative", label: "Negative" },
  { value: "settled", label: "Settled" },
  { value: "not_involving_me", label: "Not involving me" },
];

const STATUS_STYLES: Record<
  SplitwiseNetDirection,
  { label: string; className: string }
> = {
  positive: {
    label: "Net positive",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  negative: {
    label: "Net negative",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  },
  settled: {
    label: "Settled",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200",
  },
  not_involving_me: {
    label: "Not involving me",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
  },
};

const formatDateLabel = (value: string | null) => {
  if (!value) return "Unknown";

  try {
    return format(parseISO(`${value}T00:00:00Z`), "dd MMM yyyy");
  } catch (error) {
    return value;
  }
};

const formatSignedCurrency = (currencyCode: string, amount: number | null) => {
  if (amount === null || !Number.isFinite(amount)) {
    return "Not available";
  }

  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${formatCompactCurrency(currencyCode, Math.abs(amount))}`;
};

const formatSignedFullCurrency = (currencyCode: string, amount: number | null) => {
  if (amount === null || !Number.isFinite(amount)) {
    return "Not available";
  }

  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${formatCurrency(currencyCode, Math.abs(amount))}`;
};

const renderCurrencyTotals = (totals: SplitwiseCurrencyTotal[]) => {
  if (!totals.length) {
    return <span className="text-2xl font-semibold text-slate-900 dark:text-white">0</span>;
  }

  return (
    <div className="space-y-1">
      {totals.map((entry) => (
        <p
          key={`${entry.currencyCode}-${entry.total}`}
          className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          {formatCurrency(entry.currencyCode, entry.total)}
        </p>
      ))}
    </div>
  );
};

const SummaryCard = ({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900/75">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <div className="mt-3">{children}</div>
    {helper && (
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    )}
  </div>
);

const StatusBadge = ({
  direction,
  invalid,
}: {
  direction: SplitwiseNetDirection;
  invalid: boolean;
}) => {
  const status = STATUS_STYLES[direction];

  return (
    <div className="flex flex-col gap-2">
      <span
        className={clsx(
          "inline-flex w-fit whitespace-nowrap items-center rounded-full border px-2.5 py-1 text-xs font-medium",
          status.className
        )}
      >
        {status.label}
      </span>
      {invalid && (
        <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          Needs review
        </span>
      )}
    </div>
  );
};

const buildFilterCounts = (rows: SplitwiseNormalizedRow[]) => ({
  all: rows.length,
  positive: rows.filter((row) => row.netDirection === "positive").length,
  negative: rows.filter((row) => row.netDirection === "negative").length,
  settled: rows.filter((row) => row.netDirection === "settled").length,
  not_involving_me: rows.filter((row) => row.netDirection === "not_involving_me")
    .length,
});

const EmptyState = () => (
  <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/70 p-8 text-center dark:border-white/10 dark:bg-slate-900/50">
    <p className="text-lg font-semibold text-slate-900 dark:text-white">
      Fetch or paste Splitwise data to analyze it
    </p>
    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
      This route is read-only. You can fetch expenses from the Splitwise API through
      the server or paste raw Splitwise JSON manually. Either way, the analyzer keeps
      the review local to this page and shows a clean preview with full cost, paid
      share, owed share, and net direction.
    </p>
  </div>
);

const SplitwiseAnalyzerView = () => {
  const [viewerUserId, setViewerUserId] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [analysis, setAnalysis] = useState<SplitwiseAnalysisResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<SplitwiseFilterValue>("all");
  const [parseError, setParseError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSync, setApiSync] = useState<SplitwiseApiSyncResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    viewerUserId?: string;
    rawJson?: string;
  }>({});
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLElement | null>(null);
  const isBusy = isPending || isFetchingApi;

  const rows = analysis?.rows || [];
  const filterCounts = buildFilterCounts(rows);
  const visibleRows =
    activeFilter === "all"
      ? rows
      : rows.filter((row) => row.netDirection === activeFilter);

  useEffect(() => {
    if (!analysis) return;

    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [analysis]);

  useEffect(() => {
    setDemoModeEnabled(isDemoModeEnabled());
  }, []);

  const runAnalysis = (options?: {
    nextViewerUserId?: string;
    nextRawJson?: string;
  }) => {
    startTransition(() => {
      try {
        const nextAnalysis = analyzeSplitwisePayload({
          rawJson: options?.nextRawJson ?? rawJson.trim(),
          viewerUserId: options?.nextViewerUserId ?? viewerUserId.trim(),
        });

        setAnalysis(nextAnalysis);
        setActiveFilter("all");
        setParseError(null);
      } catch (error) {
        setAnalysis(null);
        setParseError(
          error instanceof Error ? error.message : "Could not analyze the Splitwise payload."
        );
      }
    });
  };

  const handleAnalyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFieldErrors: {
      viewerUserId?: string;
      rawJson?: string;
    } = {};
    const trimmedUserId = viewerUserId.trim();
    const trimmedJson = rawJson.trim();

    if (trimmedUserId && !/^\d+$/.test(trimmedUserId)) {
      nextFieldErrors.viewerUserId = "Splitwise user ID must contain digits only.";
    }

    if (!trimmedJson) {
      nextFieldErrors.rawJson = "Paste a Splitwise JSON payload to analyze.";
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    runAnalysis({ nextViewerUserId: trimmedUserId });
  };

  const handleReset = () => {
    setViewerUserId("");
    setRawJson("");
    setAnalysis(null);
    setActiveFilter("all");
    setParseError(null);
    setApiError(null);
    setApiSync(null);
    setFieldErrors({});
  };

  const handleParticipantPick = (participant: SplitwiseParticipantOption) => {
    setViewerUserId(participant.userId);
    setFieldErrors((current) => ({ ...current, viewerUserId: undefined }));
    runAnalysis({ nextViewerUserId: participant.userId });
  };

  const handleFetchFromApi = async () => {
    setApiError(null);
    setParseError(null);
    setFieldErrors({});
    setIsFetchingApi(true);

    try {
      const response = await fetchSplitwisePayloadFromApi();
      const nextRawJson = JSON.stringify(response.payload, null, 2);

      setApiSync(response);
      setViewerUserId(response.user.id);
      setRawJson(nextRawJson);
      runAnalysis({
        nextRawJson,
        nextViewerUserId: response.user.id,
      });
    } catch (error) {
      setApiSync(null);
      setApiError(
        error instanceof Error ? error.message : "Unable to fetch Splitwise data."
      );
    } finally {
      setIsFetchingApi(false);
    }
  };

  const handleLoadDemoPayload = () => {
    const response = getDemoSplitwisePayload();
    const nextRawJson = JSON.stringify(response.payload, null, 2);

    setApiError(null);
    setParseError(null);
    setFieldErrors({});
    setApiSync(response);
    setViewerUserId(response.user.id);
    setRawJson(nextRawJson);
    runAnalysis({
      nextRawJson,
      nextViewerUserId: response.user.id,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),transparent_34%)]" />
        <div className="relative">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
                Splitwise Analyzer
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Review Splitwise data without importing it
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Fetch your expenses from the Splitwise API or paste a Splitwise
                payload manually, then inspect the result locally. This route makes no
                database calls and keeps everything read-only.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <p className="font-semibold">Read-only mode</p>
              <p className="mt-1 text-xs leading-5">
                No Appwrite writes, no imports, no background sync.
              </p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <FormInputLabel htmlFor="splitwise-user-id">
                Splitwise user ID
              </FormInputLabel>
              <TextInput
                id="splitwise-user-id"
                placeholder="e.g. 25962968"
                value={viewerUserId}
                onChange={(event) => {
                  const rawValue = event.target.value;
                  if (rawValue && !/^\d*$/.test(rawValue)) return;

                  setViewerUserId(rawValue);
                  setFieldErrors((current) => ({ ...current, viewerUserId: undefined }));
                }}
                error={Boolean(fieldErrors.viewerUserId)}
                errorMessage={fieldErrors.viewerUserId}
                disabled={isBusy}
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Optional for the first pass. Add it to calculate your personal net,
                or analyze first and pick yourself from detected participants.
              </p>

              <div className="mt-5 rounded-2xl border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-200">
                  Splitwise input
                </p>
                <p className="mt-2 text-sm leading-6 text-blue-900/80 dark:text-blue-100/90">
                  Pull your current Splitwise user and expenses through the server, or
                  load a local demo payload that is ready for interviews.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    disabled={isBusy}
                    onClick={handleFetchFromApi}
                    className="!bg-blue-600 !text-white hover:!bg-blue-500 dark:!bg-blue-500 dark:hover:!bg-blue-400"
                  >
                    {isFetchingApi ? "Fetching from API..." : "Fetch from Splitwise API"}
                  </Button>
                  {demoModeEnabled && (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isBusy}
                      onClick={handleLoadDemoPayload}
                      className="dark:border-blue-400/20 dark:text-blue-100"
                    >
                      Load demo payload
                    </Button>
                  )}
                </div>
                <p className="mt-3 text-xs text-blue-800/70 dark:text-blue-100/70">
                  The API option requires <code>SPLITWISE_API_KEY</code> on the server.
                  The demo payload stays local to this page.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  What we calculate
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>Full Splitwise cost</li>
                  <li>Your paid share</li>
                  <li>Your owed share</li>
                  <li>Your net positive, net negative, or settled state</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isBusy}
                  className="!bg-blue-600 !text-white hover:!bg-blue-500 dark:!bg-blue-500 dark:hover:!bg-blue-400"
                >
                  {isPending ? "Analyzing..." : "Analyze"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <FormInputLabel htmlFor="splitwise-json">Splitwise JSON</FormInputLabel>
              <TextArea
                id="splitwise-json"
                rows={18}
                value={rawJson}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setRawJson(event.target.value);
                  setApiSync(null);
                  setFieldErrors((current) => ({ ...current, rawJson: undefined }));
                  if (parseError) {
                    setParseError(null);
                  }
                }}
                placeholder='Paste a payload like { "expenses": [ ... ] }'
                error={Boolean(fieldErrors.rawJson)}
                message={fieldErrors.rawJson}
                disabled={isBusy}
                className="min-h-[360px] font-mono text-[13px] leading-6"
              />
              {parseError && <ErrorMessage>{parseError}</ErrorMessage>}
              {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
            </div>
          </form>
        </div>
      </section>

      {analysis ? (
        <>
          {apiSync && (
            <section className="rounded-[28px] border border-blue-200/80 bg-blue-50/80 p-5 shadow-[0_20px_50px_-40px_rgba(37,99,235,0.45)] dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-100">
                    {apiSync.source === "demo_payload"
                      ? "Demo Splitwise payload loaded"
                      : "Live Splitwise payload loaded"}
                  </p>
                  <p className="mt-1 text-sm text-blue-900/80 dark:text-blue-100/80">
                    {apiSync.source === "demo_payload" ? "Loaded" : "Pulled"}{" "}
                    {apiSync.expensesCount} expense
                    {apiSync.expensesCount === 1 ? "" : "s"} for{" "}
                    {apiSync.user.displayName} (user ID {apiSync.user.id}) on{" "}
                    {format(parseISO(apiSync.fetchedAt), "dd MMM yyyy, hh:mm a")}.
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-200/80 bg-white/70 px-4 py-2 text-xs font-medium text-blue-700 dark:border-blue-400/20 dark:bg-slate-950/30 dark:text-blue-100">
                  {apiSync.source === "demo_payload"
                    ? "Source: local demo payload"
                    : "API source: Splitwise"}
                </div>
              </div>
            </section>
          )}

          <section
            ref={resultsRef}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7"
          >
            <SummaryCard
              label="Total rows parsed"
              helper="Every expense row found in the pasted payload."
            >
              <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {analysis.summary.totalRowsParsed}
              </p>
            </SummaryCard>

            <SummaryCard
              label="Rows involving me"
              helper={
                analysis.hasViewerSelection
                  ? "Rows where your Splitwise user ID appears in the participants list."
                  : "Pick your participant below to turn on personal net calculations."
              }
            >
              <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {analysis.summary.rowsInvolvingMe}
              </p>
            </SummaryCard>

            <SummaryCard
              label="Total full cost"
              helper="Sum of the Splitwise expense cost across parsed rows."
            >
              {renderCurrencyTotals(analysis.summary.fullCostTotals)}
            </SummaryCard>

            <SummaryCard
              label="Total net positive"
              helper={
                analysis.hasViewerSelection
                  ? "How much others owe you across positive-net rows."
                  : "Waiting for your Splitwise user selection."
              }
            >
              {renderCurrencyTotals(analysis.summary.positiveNetTotals)}
            </SummaryCard>

            <SummaryCard
              label="Total net negative"
              helper={
                analysis.hasViewerSelection
                  ? "How much you owe across negative-net rows."
                  : "Waiting for your Splitwise user selection."
              }
            >
              {renderCurrencyTotals(analysis.summary.negativeNetTotals)}
            </SummaryCard>

            <SummaryCard
              label="Settled count"
              helper="Rows where your net effect is zero."
            >
              <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {analysis.summary.settledCount}
              </p>
            </SummaryCard>

            <SummaryCard
              label="Not involving me"
              helper="Excluded from your net totals."
            >
              <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {analysis.summary.notInvolvingMeCount}
              </p>
            </SummaryCard>
          </section>

          {analysis.participants.length > 0 && (
            <section className="rounded-[30px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-slate-900/75 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Detected participants
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Pick yourself to recalculate paid share, owed share, and net balance
                    against the pasted payload.
                  </p>
                </div>
                {!analysis.hasViewerSelection && (
                  <div className="rounded-2xl border border-blue-200/80 bg-blue-50/80 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                    You can analyze without a user ID, but personal net stays off until
                    you choose a participant.
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {analysis.participants.map((participant) => {
                  const isActive = viewerUserId.trim() === participant.userId;

                  return (
                    <button
                      key={participant.userId}
                      type="button"
                      onClick={() => handleParticipantPick(participant)}
                      className={clsx(
                        "inline-flex items-center gap-3 rounded-2xl border px-4 py-2 text-left transition",
                        isActive
                          ? "border-blue-500 bg-blue-600 text-white shadow-[0_10px_24px_-16px_rgba(37,99,235,0.85)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
                      )}
                    >
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {participant.displayName}
                        </span>
                        <span
                          className={clsx(
                            "text-xs",
                            isActive ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          User ID {participant.userId}
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-[11px]",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                        )}
                      >
                        {participant.occurrenceCount} row
                        {participant.occurrenceCount === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-[30px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-slate-900/75 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Parsed Splitwise rows
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Full cost and your net are shown separately. Rows not involving you
                  remain visible, but they do not affect the personal net summary.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const isActive = activeFilter === option.value;
                  const count = filterCounts[option.value];

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActiveFilter(option.value)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        isActive
                          ? "border-blue-500 bg-blue-600 text-white shadow-[0_10px_22px_-18px_rgba(37,99,235,0.85)]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                      )}
                    >
                      <span>{option.label}</span>
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-[11px]",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {analysis.summary.invalidRowCount > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                {analysis.summary.invalidRowCount} row
                {analysis.summary.invalidRowCount === 1 ? "" : "s"} needed review.
                Those rows still render, but invalid numeric or date fields were not
                included in currency totals.
              </div>
            )}

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full text-sm">
                  <thead className="bg-slate-50/90 dark:bg-slate-900/80">
                    <tr className="border-b border-slate-200/80 dark:border-white/10">
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Description
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Date
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Splitwise category
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Counterparties
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Full cost
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        My paid
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        My owed
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        My net
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 bg-white/90 dark:divide-white/10 dark:bg-slate-950/40">
                    {visibleRows.length > 0 ? (
                      visibleRows.map((row) => (
                        <tr
                          key={`${row.splitwiseExpenseId}-${row.date || "unknown"}`}
                          className={clsx(
                            "align-top transition hover:bg-slate-50/70 dark:hover:bg-white/5",
                            row.netDirection === "not_involving_me" &&
                              "bg-amber-50/40 dark:bg-amber-500/5"
                          )}
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {row.description}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Splitwise #{row.splitwiseExpenseId} · Created by{" "}
                                {row.createdByName}
                              </p>
                              {row.validationErrors.length > 0 && (
                                <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">
                                  {row.validationErrors.join(", ")}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                            {formatDateLabel(row.date)}
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                            {row.splitwiseCategory}
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                            {row.counterparties.join(", ")}
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                            {row.fullCost === null
                              ? "Not available"
                              : formatCurrency(row.currencyCode, row.fullCost)}
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                            {row.myPaidShare === null
                              ? "Not available"
                              : formatCurrency(row.currencyCode, row.myPaidShare)}
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                            {row.myOwedShare === null
                              ? "Not available"
                              : formatCurrency(row.currencyCode, row.myOwedShare)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                            <span
                              className="whitespace-nowrap tabular-nums"
                              title={
                                row.myNetBalance === null
                                  ? undefined
                                  : formatSignedFullCurrency(
                                      row.currencyCode,
                                      row.myNetBalance
                                    )
                              }
                            >
                              {formatSignedCurrency(row.currencyCode, row.myNetBalance)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              direction={row.netDirection}
                              invalid={!row.isValid}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          No rows match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default SplitwiseAnalyzerView;
