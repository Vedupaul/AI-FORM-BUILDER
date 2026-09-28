import { Redis } from "ioredis";
import { env } from "./env.js";

let redis: Redis | null = null;
let isRedisConnected = false;

try {
    redis = new Redis(env.redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy(times: number) {
            if (times > 3) {
                return null; // Stop retrying if Redis is not running
            }
            return Math.min(times * 100, 1000);
        },
    });

    redis.on("connect", () => {
        isRedisConnected = true;
        console.log("⚡ Redis connected successfully");
    });

    redis.on("error", (err: any) => {
        isRedisConnected = false;
        // Suppress repeated unhandled error noise if Redis is down
        if (err?.code === "ECONNREFUSED") {
            // Keep app functional even without Redis (graceful degradation)
        } else {
            console.warn("Redis Warning:", err.message);
        }
    });

    redis.on("close", () => {
        isRedisConnected = false;
    });
} catch (error: any) {
    console.warn("Failed to initialize Redis client:", error.message);
    redis = null;
}

export { redis };

/**
 * Get cached JSON value by key
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
    if (!redis || !isRedisConnected) return null;
    try {
        const data = await redis.get(key);
        return data ? (JSON.parse(data) as T) : null;
    } catch {
        return null;
    }
}

/**
 * Set cached JSON value with TTL in seconds
 */
export async function cacheSet(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!redis || !isRedisConnected) return;
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
        // Silently fail to not break the request flow
    }
}

/**
 * Delete key(s) or patterns
 */
export async function cacheDel(...keys: string[]): Promise<void> {
    if (!redis || !isRedisConnected || !keys.length) return;
    try {
        await redis.del(...keys);
    } catch {
        // Silently fail
    }
}

/**
 * Delete keys matching wildcard pattern (e.g. cache:analytics:form:*)
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
    if (!redis || !isRedisConnected) return;
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch {
        // Silently fail
    }
}
