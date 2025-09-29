export class AppError extends Error {
    constructor(
        public code: string,
        message: string,
        public cause?: unknown,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = "AppError";
    }
}

export const isAppError = (e: unknown): e is AppError =>
    e instanceof AppError;