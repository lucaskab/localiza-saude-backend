import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "@/database/prisma";
import { env } from "@/env";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	basePath: "/api/auth",
	secret: env.BETTER_AUTH_SECRET,
	plugins: [expo(), openAPI()],
	trustedOrigins: [
		"http://localhost:8081",
		"http://localhost:8082",
		"http://localhost:3333",
		"localizasaude://",
		...(process.env.NODE_ENV === "development"
			? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
			: []),
	],
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	advanced: {
		database: {
			generateId: false,
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5,
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
});
