/**
 * Retry helper for transient database-connection failures.
 *
 * The database allows only 20 connections, shared by every warm serverless
 * instance, each build worker and any local dev server. When they are all
 * taken, Postgres rejects with 53300 ("remaining connection slots are
 * reserved"), which Prisma surfaces as P2037. That is transient — a slot frees
 * within a second or two — but without a retry it either fails a build or, if
 * the caller swallows it, bakes an empty page into the ISR cache.
 *
 * Only connection-class failures are retried. A genuine query error is
 * rethrown at once, so a bug does not get masked behind three slow attempts.
 */

const RETRYABLE = [
    "P2037",   // Prisma: too many database connections
    "P1001",   // Prisma: cannot reach database server
    "P1008",   // Prisma: operation timed out
    "P1017",   // Prisma: server has closed the connection
    "53300",   // Postgres: too many connections
    "08006",   // Postgres: connection failure
    "08001",   // Postgres: unable to connect
]

function isRetryable(error: unknown): boolean {
    if (!error || typeof error !== "object") return false
    const code = (error as { code?: unknown }).code
    if (typeof code === "string" && RETRYABLE.includes(code)) return true
    // The adapter sometimes wraps the driver error, leaving only the message.
    const message = (error as { message?: unknown }).message
    return (
        typeof message === "string" &&
        /too many database connections|remaining connection slots|Can't reach database/i.test(message)
    )
}

/**
 * Runs `work`, retrying a connection-class failure with backoff.
 *
 * Defaults to 4 attempts over roughly 1.7s, which is long enough to ride out
 * contention but short enough not to hold a request open.
 */
export async function withDbRetry<T>(
    work: () => Promise<T>,
    { attempts = 4, baseDelayMs = 200, label = "query" }: {
        attempts?: number
        baseDelayMs?: number
        label?: string
    } = {}
): Promise<T> {
    let lastError: unknown

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await work()
        } catch (error) {
            lastError = error
            if (!isRetryable(error) || attempt === attempts) throw error

            // 200ms, 400ms, 800ms — plus jitter, so parallel callers that all
            // failed together do not retry in lockstep and collide again.
            const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100
            console.warn(
                `${label}: database busy (attempt ${attempt}/${attempts}), retrying in ${Math.round(delay)}ms`
            )
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
    }

    throw lastError
}
