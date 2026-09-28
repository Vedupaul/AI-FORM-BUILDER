import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis.js";
import ApiError from "../utils/ApiError.js";

/**
 * Rate limiter middleware that limits users to a specific number of AI form generations per day.
 * Default: 5 generations per 24 hours per user.
 */
export async function aiDailyLimit(req: Request, res: Response, next: NextFunction) {
    if (!redis) {
        // If Redis is not initialized, allow request through gracefully
        return next();
    }

    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return next(ApiError.unauthorized("Authentication required"));
    }

    const today = new Date().toISOString().slice(0, 10); // e.g. "2026-09-28"
    const key = `ratelimit:ai_form:${userId}:${today}`;
    const MAX_DAILY_GENERATIONS = 5;

    try {
        const count = await redis.incr(key);

        if (count === 1) {
            // Set expiration to 24 hours (86400 seconds) on the first hit
            await redis.expire(key, 86400);
        }

        // Add remaining count header
        const remaining = Math.max(0, MAX_DAILY_GENERATIONS - count);
        res.setHeader("X-RateLimit-Limit", MAX_DAILY_GENERATIONS);
        res.setHeader("X-RateLimit-Remaining", remaining);

        if (count > MAX_DAILY_GENERATIONS) {
            return next(
                new ApiError(
                    429,
                    `Daily AI form generation limit reached (${MAX_DAILY_GENERATIONS}/day). Please try again tomorrow.`
                )
            );
        }

        next();
    } catch {
        // Fail open if Redis has a runtime error so users aren't locked out
        next();
    }
}
