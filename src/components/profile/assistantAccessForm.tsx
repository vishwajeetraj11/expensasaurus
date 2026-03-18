import Button from "expensasaurus/components/ui/Button";
import { ASSISTANT_NOT_AVAILABLE_MESSAGE } from "expensasaurus/shared/constants/assistantAccess";
import {
  AssistantAccessStatus,
  fetchAssistantAccessStatus,
  updateAssistantAccessStatus,
} from "expensasaurus/shared/services/assistantAccess";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formatUpdatedAt = (value: string | null) => {
  if (!value) return "Not updated yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not updated yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const AssistantAccessForm = () => {
  const [status, setStatus] = useState<AssistantAccessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadStatus = async () => {
      try {
        const nextStatus = await fetchAssistantAccessStatus();
        if (!isCancelled) {
          setStatus(nextStatus);
        }
      } catch (error) {
        if (!isCancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load assistant access."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadStatus();

    return () => {
      isCancelled = true;
    };
  }, []);

  const onToggleAccess = async () => {
    if (!status) return;

    setIsSaving(true);
    try {
      const nextStatus = await updateAssistantAccessStatus(
        !status.enabledForEveryone
      );
      setStatus(nextStatus);
      toast.success(
        nextStatus.enabledForEveryone
          ? "Assistant is now enabled for everyone."
          : "Assistant access is now limited to admin."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update assistant access."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Assistant rollout
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Loading assistant access settings...
        </p>
      </section>
    );
  }

  if (!status?.isAdmin) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Assistant rollout
            </h2>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                status.enabledForEveryone
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
              }`}
            >
              {status.enabledForEveryone
                ? "Enabled for everyone"
                : "Admin only"}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Turn this on when Assistant is ready for all users. When it is off,
            non-admin users will see: &quot;
            {ASSISTANT_NOT_AVAILABLE_MESSAGE}
            &quot;
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last updated: {formatUpdatedAt(status.updatedAt)}
            {status.updatedBy ? ` by ${status.updatedBy}` : ""}
          </p>
        </div>

        <Button
          type="button"
          disabled={isSaving}
          loading={isSaving}
          onClick={onToggleAccess}
          className="min-w-[220px] rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
        >
          {status.enabledForEveryone
            ? "Restrict to admin"
            : "Allow all users"}
        </Button>
      </div>
    </section>
  );
};

export default AssistantAccessForm;
