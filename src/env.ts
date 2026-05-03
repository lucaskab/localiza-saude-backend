import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url().startsWith("postgres://"),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	APPLE_CLIENT_ID: z.string().optional(),
	APPLE_CLIENT_SECRET: z.string().optional(),
	APPLE_APP_BUNDLE_IDENTIFIER: z.string().optional(),
	APPLE_APP_BUNDLE_IDENTIFIERS: z.string().optional(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),
	WEB_APP_URL: z.url().optional(),
	R2_ACCOUNT_ID: z.string(),
	R2_ACCESS_KEY_ID: z.string(),
	R2_SECRET_ACCESS_KEY: z.string(),
	R2_BUCKET_NAME: z.string(),
	R2_PUBLIC_URL: z.url(),
});

export const env = envSchema.parse(process.env);
