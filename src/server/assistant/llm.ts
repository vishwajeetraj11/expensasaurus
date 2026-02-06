import type { NextApiResponse } from "next";
import {
  EXPENSE_CATEGORY_OPTIONS,
  INCOME_CATEGORY_OPTIONS,
  sanitizeBase64,
} from "./heuristics";
import { AssistantResponse, ContextMessage, StreamEvent } from "./types";

const parseJsonFromText = (text: string) => {
  const fenced = text.match(/```json([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (err) {
      return null;
    }
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (err) {
      return null;
    }
  }

  return null;
};

const extractReplyFromJsonBuffer = (buffer: string) => {
  const keyIndex = buffer.indexOf('"reply"');
  if (keyIndex === -1) return null;
  const colonIndex = buffer.indexOf(":", keyIndex);
  if (colonIndex === -1) return null;
  const quoteIndex = buffer.indexOf('"', colonIndex);
  if (quoteIndex === -1) return null;

  let result = "";
  let escaped = false;
  for (let i = quoteIndex + 1; i < buffer.length; i += 1) {
    const char = buffer[i];
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      return result;
    }
    result += char;
  }

  return result;
};

const buildResponseSchema = () => ({
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    parsed: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { type: "string", enum: ["expense", "income"] },
        amount: { type: "number" },
        currency: { type: "string" },
        date: { type: "string" },
        category: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        tag: { type: "string" },
      },
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string", enum: ["expense", "income"] },
          amount: { type: "number" },
          currency: { type: "string" },
          date: { type: "string" },
          category: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          tag: { type: "string" },
        },
      },
    },
    missing: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["reply", "missing"],
});

const extractOpenAIText = (payload: any) => {
  if (typeof payload?.output_text === "string") {
    return payload.output_text;
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const parts = output.flatMap((item: any) =>
    Array.isArray(item?.content) ? item.content : []
  );
  const texts = parts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean);
  return texts.join("\n");
};

const buildSystemPrompt = (todayIso: string) =>
  [
    "You are a personal finance parsing assistant for expenses and income.",
    "Decide whether each entry is an expense or income and set type to expense or income.",
    "Always include type for parsed or each item.",
    "Always include type for parsed or each item.",
    `For expenses, category must be one of: ${EXPENSE_CATEGORY_OPTIONS.join(", ")}.`,
    `For income, category must be one of: ${INCOME_CATEGORY_OPTIONS.join(", ")}.`,
    "Return JSON that matches the provided schema only.",
    "If the user includes multiple entries, return them as an array in items and omit parsed.",
    "If a required field is missing, include it in missing.",
    "Dates must be formatted as YYYY-MM-DD.",
    `Today is ${todayIso}. If the user does not specify a date, use today and do not add date to missing.`,
    "If the user does not specify a currency, use INR and do not add currency to missing.",
  ].join("\n");

const buildInputMessages = (payload: {
  text: string;
  contextMessages?: ContextMessage[];
  imageDataUrl?: string | null;
  systemPrompt: string;
}) => {
  const messages: Array<Record<string, any>> = [];

  messages.push({
    role: "system",
    content: [{ type: "input_text", text: payload.systemPrompt }],
  });

  if (payload.contextMessages?.length) {
    payload.contextMessages.forEach((message) => {
      messages.push({
        role: message.role,
        content: [{ type: "input_text", text: message.text }],
      });
    });
  }

  const content: Array<Record<string, any>> = [
    {
      type: "input_text",
      text: payload.text || "No text provided.",
    },
  ];

  if (payload.imageDataUrl) {
    content.push({
      type: "input_image",
      image_url: payload.imageDataUrl,
    });
  }

  messages.push({ role: "user", content });

  return messages;
};

export const resolveOpenAIModel = (hasImage: boolean) => {
  const fallbackTextModel = "gpt-4.1-nano";
  const fallbackImageModel = "gpt-4.1-mini";

  if (hasImage) {
    return (
      process.env.OPENAI_IMAGE_MODEL ||
      process.env.OPENAI_MODEL ||
      fallbackImageModel
    );
  }

  return (
    process.env.OPENAI_TEXT_MODEL ||
    process.env.OPENAI_MODEL ||
    fallbackTextModel
  );
};

export const callOpenAI = async (payload: {
  text: string;
  imageDataUrl?: string | null;
  contextMessages?: ContextMessage[];
  todayIso: string;
  model: string;
}): Promise<AssistantResponse | null> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(payload.todayIso);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: payload.model,
      input: buildInputMessages({
        text: payload.text,
        imageDataUrl: payload.imageDataUrl,
        contextMessages: payload.contextMessages,
        systemPrompt,
      }),
      store: false,
      temperature: 0.2,
      text: {
        format: {
          type: "json_schema",
          name: "expense_draft",
          strict: true,
          schema: buildResponseSchema(),
        },
      },
    }),
  });

  if (!response.ok) return null;

  const json = await response.json();
  const combinedText = extractOpenAIText(json);
  const parsed = combinedText ? parseJsonFromText(combinedText) : null;

  if (!parsed || typeof parsed !== "object") return null;

  return {
    reply: parsed.reply || "Here is a draft based on that.",
    parsed: parsed.parsed,
    items: parsed.items,
    missing: parsed.missing || [],
  };
};

export const streamOpenAI = async (options: {
  res: NextApiResponse;
  text: string;
  imageDataUrl?: string | null;
  contextMessages?: ContextMessage[];
  todayIso: string;
  model: string;
}): Promise<boolean> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return false;

  const systemPrompt = buildSystemPrompt(options.todayIso);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      input: buildInputMessages({
        text: options.text,
        imageDataUrl: options.imageDataUrl,
        contextMessages: options.contextMessages,
        systemPrompt,
      }),
      store: false,
      temperature: 0.2,
      stream: true,
      text: {
        format: {
          type: "json_schema",
          name: "expense_draft",
          strict: true,
          schema: buildResponseSchema(),
        },
      },
    }),
  });

  if (!response.ok || !response.body) return false;

  const decoder = new TextDecoder();
  let buffer = "";
  let textBuffer = "";
  let lastReply = "";
  let lastDraftSignature = "";

  const sendEvent = (event: StreamEvent) => {
    options.res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const maybeSendDraft = () => {
    const parsed = parseJsonFromText(textBuffer);
    if (!parsed || typeof parsed !== "object") return;
    const signature = JSON.stringify(parsed);
    if (signature === lastDraftSignature) return;

    lastDraftSignature = signature;
    sendEvent({
      type: "draft",
      reply: parsed.reply,
      parsed: parsed.parsed,
      items: parsed.items,
      missing: parsed.missing || [],
    });
  };

  const maybeSendReplyDelta = () => {
    const replyText = extractReplyFromJsonBuffer(textBuffer);
    if (replyText === null) return;
    if (replyText.length <= lastReply.length) return;
    const delta = replyText.slice(lastReply.length);
    lastReply = replyText;
    sendEvent({ type: "reply_delta", delta });
  };

  for await (const chunk of response.body as any) {
    buffer += decoder.decode(chunk, { stream: true });
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

        if (data === "[DONE]") {
          sendEvent({ type: "done" });
          options.res.end();
          return true;
        }

        if (data) {
          try {
            const event = JSON.parse(data);
            if (event.type === "response.output_text.delta") {
              if (typeof event.delta === "string") {
                textBuffer += event.delta;
                maybeSendReplyDelta();
                maybeSendDraft();
              }
            }

            if (event.type === "response.refusal.delta") {
              sendEvent({
                type: "error",
                message: event.delta || "Request refused.",
              });
            }

            if (event.type === "response.error") {
              sendEvent({
                type: "error",
                message: event.error?.message || "OpenAI error.",
              });
            }

            if (event.type === "response.completed") {
              maybeSendDraft();
              sendEvent({ type: "done" });
              options.res.end();
              return true;
            }
          } catch (err) {
            // ignore malformed chunks
          }
        }
      }

      boundaryIndex = buffer.indexOf("\n\n");
    }
  }

  sendEvent({ type: "done" });
  options.res.end();
  return true;
};

export const callGemini = async (payload: {
  text: string;
  imageDataUrl?: string | null;
  imageType?: string;
  todayIso: string;
}): Promise<AssistantResponse | null> => {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;

  const prompt = [
    "You are a personal finance parsing assistant for expenses and income.",
    "Decide whether each entry is an expense or income and set type to expense or income.",
    `For expenses, category must be one of: ${EXPENSE_CATEGORY_OPTIONS.join(", ")}.`,
    `For income, category must be one of: ${INCOME_CATEGORY_OPTIONS.join(", ")}.`,
    "Return ONLY valid JSON with this shape:",
    '{ "reply": string, "parsed"?: { "type"?: "expense" | "income", "amount"?: number, "currency"?: string, "date"?: "YYYY-MM-DD", "category"?: string, "title"?: string, "description"?: string, "tag"?: string }, "items"?: ParsedExpense[], "missing": string[] }',
    "If the user includes multiple entries, return them as an array in items and omit parsed.",
    "If you cannot infer a required field, add it to missing.",
    `Today is ${payload.todayIso}. If the user does not specify a date, use today and do not add date to missing.`,
    "If the user does not specify a currency, use INR and do not add currency to missing.",
    "If the user provides an image, infer details from it when possible.",
    `User message: ${payload.text || "(no text provided)"}`,
  ].join("\n");

  try {
    const parts: Array<Record<string, any>> = [{ text: prompt }];
    if (payload.imageDataUrl) {
      parts.unshift({
        inline_data: {
          mime_type: payload.imageType || "image/jpeg",
          data: sanitizeBase64(payload.imageDataUrl),
        },
      });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
      }),
    });

    const json = await response.json();
    if (!response.ok) return null;

    const textParts = json?.candidates?.[0]?.content?.parts || [];
    const combinedText = textParts
      .map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("\n");

    const parsed = combinedText ? parseJsonFromText(combinedText) : null;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      reply: parsed.reply || "Here is a draft based on that.",
      parsed: parsed.parsed,
      items: parsed.items,
      missing: parsed.missing || [],
    };
  } catch (err) {
    return null;
  }
};
