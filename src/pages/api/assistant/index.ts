import type { NextApiRequest, NextApiResponse } from "next";
import { ASSISTANT_NOT_AVAILABLE_MESSAGE } from "expensasaurus/shared/constants/assistantAccess";
import {
  getAssistantAccessState,
  getBearerToken,
  getClientIp,
  verifyAuthenticatedUser,
} from "expensasaurus/server/assistant/auth";
import {
  buildFallbackResponse,
  ensureDataUrl,
  getFirstDisallowedCurrency,
  normalizeCurrencyCode,
  resolveAssistantCurrency,
} from "expensasaurus/server/assistant/heuristics";
import {
  callGemini,
  callOpenAI,
  resolveOpenAIModel,
  streamOpenAI,
} from "expensasaurus/server/assistant/llm";
import { parseWithRulesFirst } from "expensasaurus/server/assistant/rulesEngine";
import {
  applyRateLimit,
  IP_RATE_LIMIT_MAX,
  setRateLimitHeaders,
  USER_RATE_LIMIT_MAX,
} from "expensasaurus/server/assistant/rateLimit";
import {
  AssistantResponse,
  ContextMessage,
  ParsedExpense,
  RuleLockContext,
} from "expensasaurus/server/assistant/types";

const ASSISTANT_RULES_FIRST_ENABLED =
  process.env.ASSISTANT_RULES_FIRST_ENABLED !== "false";

const buildCurrencyGuardResponse = (
  allowedCurrency: string,
  attemptedCurrency?: string | null
): AssistantResponse => {
  const attempted = normalizeCurrencyCode(attemptedCurrency);
  const attemptedText =
    attempted && attempted !== allowedCurrency ? ` (${attempted})` : "";

  return {
    reply: `Your account uses ${allowedCurrency} only. I cannot accept other currencies${attemptedText}. Please send the amount in ${allowedCurrency}.`,
    missing: ["currency"],
  };
};

const logAssistantEvent = (
  event:
    | "rule_hit"
    | "ai_skipped_complete"
    | "ai_fallback_incomplete"
    | "rule_ai_conflict_resolved",
  metadata: Record<string, unknown>
) => {
  console.info(
    `[assistant] ${event} ${JSON.stringify({
      timestamp: new Date().toISOString(),
      ...metadata,
    })}`
  );
};

const applyLockToDraft = (
  draft: ParsedExpense,
  lock?: RuleLockContext
): { draft: ParsedExpense; conflict: boolean } => {
  if (!lock) return { draft, conflict: false };

  const conflict =
    (draft.type && draft.type !== lock.type) ||
    (draft.category && draft.category !== lock.category);

  return {
    draft: {
      ...draft,
      type: lock.type,
      category: lock.category,
      tag: lock.category.toLowerCase(),
    },
    conflict: Boolean(conflict),
  };
};

const applyResponsePolicies = (
  response: AssistantResponse,
  allowedCurrency: string,
  lock?: RuleLockContext
): { response: AssistantResponse; conflictResolved: boolean } => {
  const normalizedParsedWithLock = response.parsed
    ? applyLockToDraft(response.parsed, lock)
    : undefined;
  const normalizedItemsWithLock = response.items?.map((item) =>
    applyLockToDraft(item, lock)
  );
  const normalizedParsed = normalizedParsedWithLock
    ? {
        ...normalizedParsedWithLock.draft,
        currency: allowedCurrency,
      }
    : undefined;
  const normalizedItems = normalizedItemsWithLock?.map((value) => ({
    ...value.draft,
    currency: allowedCurrency,
  }));
  const conflictResolved = Boolean(
    normalizedParsedWithLock?.conflict ||
      normalizedItemsWithLock?.some((value) => value.conflict)
  );
  const missingSet = new Set(response.missing || []);
  missingSet.delete("currency");
  if (lock) {
    missingSet.delete("type");
    missingSet.delete("category");
  }

  return {
    response: {
      ...response,
      parsed: normalizedParsed,
      items: normalizedItems,
      missing: Array.from(missingSet),
    },
    conflictResolved,
  };
};

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

  const assistantAccess = await getAssistantAccessState(authenticatedUser.email);
  if (!assistantAccess.canUseAssistant) {
    return res.status(403).json({ reply: ASSISTANT_NOT_AVAILABLE_MESSAGE });
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
  const defaultCurrency = resolveAssistantCurrency(authenticatedUser.preferredCurrency);
  const disallowedUserCurrency = getFirstDisallowedCurrency(
    parsedText,
    defaultCurrency
  );
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

  if (disallowedUserCurrency) {
    const blockedResponse = buildCurrencyGuardResponse(
      defaultCurrency,
      disallowedUserCurrency
    );
    if (stream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.flushHeaders?.();
      res.write(`data: ${JSON.stringify({ type: "final", ...blockedResponse })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
      return;
    }
    return res.status(200).json(blockedResponse);
  }

  const ruleParseResult =
    ASSISTANT_RULES_FIRST_ENABLED && !imageDataUrl && parsedText.trim()
      ? parseWithRulesFirst({
          text: parsedText,
          defaultCurrency,
        })
      : null;
  const ruleLock = ruleParseResult?.lock;

  if (ruleParseResult?.hit) {
    logAssistantEvent("rule_hit", {
      userId: authenticatedUser.userId,
      ruleId: ruleParseResult.hit.ruleId,
      matchedToken: ruleParseResult.hit.matchedToken,
      type: ruleParseResult.hit.type,
      category: ruleParseResult.hit.category,
      confidence: ruleParseResult.hit.confidence,
      isMultiEntry: ruleParseResult.isMultiEntry,
    });
  }

  if (ruleParseResult?.shouldSkipAI && ruleParseResult.parsedPartial) {
    logAssistantEvent("ai_skipped_complete", {
      userId: authenticatedUser.userId,
      ruleId: ruleParseResult.hit?.ruleId,
      category: ruleParseResult.hit?.category,
      type: ruleParseResult.hit?.type,
    });

    const deterministic = applyResponsePolicies(
      {
        reply: `Mapped to ${ruleParseResult.hit?.category} (${ruleParseResult.hit?.type}) using "${ruleParseResult.hit?.matchedToken}". Review and save.`,
        parsed: ruleParseResult.parsedPartial,
        missing: ruleParseResult.missing,
      },
      defaultCurrency,
      ruleLock
    ).response;

    if (stream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.flushHeaders?.();
      res.write(`data: ${JSON.stringify({ type: "final", ...deterministic })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
      return;
    }

    return res.status(200).json(deterministic);
  }

  if (ruleParseResult?.hit && !ruleParseResult.shouldSkipAI) {
    logAssistantEvent("ai_fallback_incomplete", {
      userId: authenticatedUser.userId,
      ruleId: ruleParseResult.hit.ruleId,
      missing: ruleParseResult.missing,
      isMultiEntry: ruleParseResult.isMultiEntry,
    });
  }

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
      defaultCurrency,
      lock: ruleLock,
      model: openaiModel,
    });

    if (streamed) return;

    const fallback =
      (await callGemini({
        text: parsedText,
        imageDataUrl,
        imageType: String(image?.type || "image/jpeg"),
        contextMessages,
        todayIso,
        defaultCurrency,
        lock: ruleLock,
      })) || buildFallbackResponse(parsedText, contextMessages, defaultCurrency);

    const normalizedFallback = applyResponsePolicies(
      fallback,
      defaultCurrency,
      ruleLock
    );
    if (normalizedFallback.conflictResolved) {
      logAssistantEvent("rule_ai_conflict_resolved", {
        userId: authenticatedUser.userId,
        source: "stream_fallback",
        ruleId: ruleLock?.ruleId,
      });
    }

    res.write(
      `data: ${JSON.stringify({ type: "final", ...normalizedFallback.response })}\n\n`
    );
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }

  const openaiResponse = await callOpenAI({
    text: parsedText,
    imageDataUrl,
    contextMessages,
    todayIso,
    defaultCurrency,
    lock: ruleLock,
    model: openaiModel,
  });

  if (openaiResponse) {
    const normalizedResponse = applyResponsePolicies(
      openaiResponse,
      defaultCurrency,
      ruleLock
    );
    if (normalizedResponse.conflictResolved) {
      logAssistantEvent("rule_ai_conflict_resolved", {
        userId: authenticatedUser.userId,
        source: "openai",
        ruleId: ruleLock?.ruleId,
      });
    }
    return res.status(200).json(normalizedResponse.response);
  }

  const geminiResponse = await callGemini({
    text: parsedText,
    imageDataUrl,
    imageType: String(image?.type || "image/jpeg"),
    contextMessages,
    todayIso,
    defaultCurrency,
    lock: ruleLock,
  });

  if (geminiResponse) {
    const normalizedResponse = applyResponsePolicies(
      geminiResponse,
      defaultCurrency,
      ruleLock
    );
    if (normalizedResponse.conflictResolved) {
      logAssistantEvent("rule_ai_conflict_resolved", {
        userId: authenticatedUser.userId,
        source: "gemini",
        ruleId: ruleLock?.ruleId,
      });
    }
    return res.status(200).json(normalizedResponse.response);
  }

  const fallbackResponse = buildFallbackResponse(
    parsedText,
    contextMessages,
    defaultCurrency
  );
  const normalizedFallback = applyResponsePolicies(
    fallbackResponse,
    defaultCurrency,
    ruleLock
  );
  if (normalizedFallback.conflictResolved) {
    logAssistantEvent("rule_ai_conflict_resolved", {
      userId: authenticatedUser.userId,
      source: "heuristic_fallback",
      ruleId: ruleLock?.ruleId,
    });
  }
  return res.status(200).json(normalizedFallback.response);
}
