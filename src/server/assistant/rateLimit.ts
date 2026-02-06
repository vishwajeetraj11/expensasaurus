import type { NextApiResponse } from "next";
import { RateLimitEntry } from "./types";

const RATE_LIMIT_WINDOW_MS = Number(
  process.env.ASSISTANT_RATE_LIMIT_WINDOW_MS || 60_000
);

const rateLimitStore = new Map<string, RateLimitEntry>();

export const IP_RATE_LIMIT_MAX = Number(
  process.env.ASSISTANT_IP_RATE_LIMIT_MAX || 60
);

export const USER_RATE_LIMIT_MAX = Number(
  process.env.ASSISTANT_USER_RATE_LIMIT_MAX || 20
);

export const applyRateLimit = (key: string, limit: number) => {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  const nextCount = existing.count + 1;
  const updated = { count: nextCount, resetAt: existing.resetAt };
  rateLimitStore.set(key, updated);

  return {
    allowed: nextCount <= limit,
    remaining: Math.max(0, limit - nextCount),
    resetAt: existing.resetAt,
  };
};

export const setRateLimitHeaders = (
  res: NextApiResponse,
  limit: number,
  result: { remaining: number; resetAt: number }
) => {
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(result.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
};
