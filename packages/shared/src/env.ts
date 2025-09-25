import { z } from "zod";
import { AppError } from "./errors";
//
export const BaseEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    SERVICE_NAME: z.string().default("unknown"),
    PORT: z.coerce.number().int().positive().default(3000)
});
//
export type BaseEnv = z.infer<typeof BaseEnvSchema>;
//
// export function loadEnv<TSchema extends z.ZodTypeAny>(
//     schema?: TSchema,
//     source?: Record<string, unknown>
// ): z.infer<TSchema extends z.ZodTypeAny ? TSchema : typeof BaseEnvSchema> & BaseEnv {
//     const input = source ?? (typeof process !== "undefined" ? (process as any).env : {});
//     const merged = schema ? BaseEnvSchema.merge(schema) : BaseEnvSchema;
//     const parsed = merged.safeParse(input);
//     if (!parsed.success) {
//         throw new AppError("ENV_VALIDATION", "Invalid environment variables", parsed.error.format());
//     }
//     return parsed.data as any;
// }
