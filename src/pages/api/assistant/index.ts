import type { NextApiRequest, NextApiResponse } from "next";
import {
  ASSISTANT_ALLOWED_EMAIL,
  getBearerToken,
  getClientIp,
  normalizeEmail,
  verifyAuthenticatedUser,
} from "expensasaurus/server/assistant/auth";
import {
  buildFallbackResponse,
  ensureDataUrl,
} from "expensasaurus/server/assistant/heuristics";
import {
  callGemini,
  callOpenAI,
  resolveOpenAIModel,
  streamOpenAI,
} from "expensasaurus/server/assistant/llm";
import {
  applyRateLimit,
  IP_RATE_LIMIT_MAX,
  setRateLimitHeaders,
  USER_RATE_LIMIT_MAX,
} from "expensasaurus/server/assistant/rateLimit";
import { AssistantResponse, ContextMessage } from "expensasaurus/server/assistant/types";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AssistantResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed." });
  }

  const ip = getClientIp(req);
  const ipRate = applyRateLimit(`assistant:ip:${ip}`, IP_RATE_LIMIT_MAX);
  setRateLimitHeaders(res, IP_RATE_LIMIT_MAX, ipRate);
  if (!ipRate.allowed) {
    return res
      .status(429)
      .json({ reply: "Too many requests. Please try again shortly." });
  }

  const token = getBearerToken(req);
  const authenticatedUser = await verifyAuthenticatedUser(token);
  if (!authenticatedUser) {
    return res.status(401).json({ reply: "Unauthorized." });
  }

  if (normalizeEmail(authenticatedUser.email) !== ASSISTANT_ALLOWED_EMAIL) {
    return res
      .status(403)
      .json({ reply: "Assistant is restricted for this account." });
  }

  const userRate = applyRateLimit(
    `assistant:user:${authenticatedUser.userId}`,
    USER_RATE_LIMIT_MAX
  );
  setRateLimitHeaders(res, USER_RATE_LIMIT_MAX, userRate);
  if (!userRate.allowed) {
    return res
      .status(429)
      .json({ reply: "Too many requests. Please try again shortly." });
  }

  const { text = "", image, messages, stream } = req.body || {};

  if (!text && !image) {
    return res.status(400).json({ reply: "Send a message or attach an image." });
  }

  const parsedText = typeof text === "string" ? text : "";
  const imageDataUrl = image?.data
    ? ensureDataUrl(String(image.data), String(image.type || "image/jpeg"))
    : null;
  const todayIso = new Date().toISOString().split("T")[0];
  const openaiModel = resolveOpenAIModel(Boolean(imageDataUrl));

  const contextMessages: ContextMessage[] | undefined = Array.isArray(messages)
    ? messages
        .filter((message) => message?.text && message?.role)
        .map(
          (message): ContextMessage => ({
            role: message.role === "assistant" ? "assistant" : "user",
            text: String(message.text),
          })
        )
    : undefined;

  if (stream) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders?.();

    const streamed = await streamOpenAI({
      res,
      text: parsedText,
      imageDataUrl,
      contextMessages,
      todayIso,
      model: openaiModel,
    });

    if (streamed) return;

    const fallback =
      (await callGemini({
        text: parsedText,
        imageDataUrl,
        imageType: String(image?.type || "image/jpeg"),
        todayIso,
      })) || buildFallbackResponse(parsedText);

    res.write(`data: ${JSON.stringify({ type: "final", ...fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }

  const openaiResponse = await callOpenAI({
    text: parsedText,
    imageDataUrl,
    contextMessages,
    todayIso,
    model: openaiModel,
  });

  if (openaiResponse) {
    return res.status(200).json(openaiResponse);
  }

  const geminiResponse = await callGemini({
    text: parsedText,
    imageDataUrl,
    imageType: String(image?.type || "image/jpeg"),
    todayIso,
  });

  if (geminiResponse) {
    return res.status(200).json(geminiResponse);
  }

  return res.status(200).json(buildFallbackResponse(parsedText));
}
