// Simple in-memory rate limiter
// For production, consider using Redis or a database

interface RateLimitEntry {
    count: number
    resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    maxAttempts: number
    windowMs: number
}

export const RATE_LIMITS = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
} as const

export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    if (!entry || entry.resetAt < now) {
        // First attempt or window expired
        const resetAt = now + config.windowMs
        rateLimitStore.set(identifier, { count: 1, resetAt })
        return {
            allowed: true,
            remaining: config.maxAttempts - 1,
            resetAt,
        }
    }

    if (entry.count >= config.maxAttempts) {
        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
        }
    }

    // Increment count
    entry.count++
    return {
        allowed: true,
        remaining: config.maxAttempts - entry.count,
        resetAt: entry.resetAt,
    }
}

export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier)
}
