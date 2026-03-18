import { promises as fs } from "fs";
import path from "path";

export type AssistantAccessSettings = {
  enabledForEveryone: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

const DEFAULT_ASSISTANT_ACCESS_SETTINGS: AssistantAccessSettings = {
  enabledForEveryone: false,
  updatedAt: null,
  updatedBy: null,
};

const assistantAccessSettingsPath = path.join(
  process.cwd(),
  "data",
  "assistant-access.json"
);

const isAssistantAccessSettings = (
  value: unknown
): value is AssistantAccessSettings => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.enabledForEveryone === "boolean" &&
    (candidate.updatedAt === null || typeof candidate.updatedAt === "string") &&
    (candidate.updatedBy === null || typeof candidate.updatedBy === "string")
  );
};

export const readAssistantAccessSettings =
  async (): Promise<AssistantAccessSettings> => {
    try {
      const raw = await fs.readFile(assistantAccessSettingsPath, "utf8");
      const parsed = JSON.parse(raw) as unknown;

      if (isAssistantAccessSettings(parsed)) {
        return parsed;
      }

      return DEFAULT_ASSISTANT_ACCESS_SETTINGS;
    } catch {
      return DEFAULT_ASSISTANT_ACCESS_SETTINGS;
    }
  };

export const writeAssistantAccessSettings = async (
  settings: AssistantAccessSettings
) => {
    await fs.mkdir(path.dirname(assistantAccessSettingsPath), {
      recursive: true,
    });
    await fs.writeFile(
      assistantAccessSettingsPath,
      JSON.stringify(settings, null, 2),
      "utf8"
    );

    return settings;
  };
