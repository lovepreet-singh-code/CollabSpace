import { logger } from "./logger";

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;
            if (attempt >= retries) {
                throw error;
            }
            logger.warn(`Retry attempt ${attempt} failed: ${error.message}. Retrying in ${delayMs}ms...`);
            await new Promise((res) => setTimeout(res, delayMs));
            delayMs *= 2; // Exponential backoff
        }
    }
    throw new Error("Unreachable");
}
