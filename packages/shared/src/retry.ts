type RetryOpts = {
    retries?: number;
    baseMs?: number;      // initial backoff
    maxMs?: number;       // cap
    shouldRetry?: (e: unknown) => boolean;
};

export async function retry<T>(fn: () => Promise<T>, opts: RetryOpts = {}): Promise<T> {
    const retries = opts.retries ?? 3;
    const base = opts.baseMs ?? 100;
    const max = opts.maxMs ?? 2000;
    const shouldRetry = opts.shouldRetry ?? (() => true);

    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            return await fn();
        } catch (e) {
            attempt++;
            if (attempt > retries || !shouldRetry(e)) throw e;
            const delay = Math.min(max, base * 2 ** (attempt - 1));
            await new Promise((r) => setTimeout(r, delay));
        }
    }
}
