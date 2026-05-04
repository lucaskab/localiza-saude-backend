import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "@/database/prisma";
import { env } from "@/env";

const appleBundleIdentifiers =
	env.APPLE_APP_BUNDLE_IDENTIFIERS?.split(",")
		.map((bundleIdentifier) => bundleIdentifier.trim())
		.filter(Boolean) ??
	(env.APPLE_APP_BUNDLE_IDENTIFIER ? [env.APPLE_APP_BUNDLE_IDENTIFIER] : []);

const webOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
	"http://127.0.0.1:5173",
	"http://127.0.0.1:5174",
	...(env.WEB_APP_URL ? [env.WEB_APP_URL] : []),
	"https://localiza-saude-web.onrender.com",
];

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	basePath: "/api/auth",
	secret: env.BETTER_AUTH_SECRET,
	plugins: [expo(), openAPI()],
	trustedOrigins: [
		"http://localhost:8081",
		"http://localhost:8082",
		"http://localhost:3333",
		...webOrigins,
		"https://appleid.apple.com",
		"localizasaude://",
		...(process.env.NODE_ENV === "development"
			? [
					"exp://",
					"exp://**",
					"exp://192.168.*.*:*/**",
					"http://192.168.*.*:*",
					"http://10.0.*.*:*",
					"http://172.16.*.*:*",
				]
			: []),
	],
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	advanced: {
		...(process.env.NODE_ENV === "production"
			? {
					defaultCookieAttributes: {
						httpOnly: true,
						sameSite: "none" as const,
						secure: true,
					},
				}
			: {}),
		database: {
			generateId: false,
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "CUSTOMER",
			},
			firstName: {
				type: "string",
				required: false,
			},
			lastName: {
				type: "string",
				required: false,
			},
			phone: {
				type: "string",
				required: false,
			},
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
		apple: {
			clientId: env.APPLE_CLIENT_ID ?? appleBundleIdentifiers[0] ?? "",
			clientSecret: env.APPLE_CLIENT_SECRET,
			appBundleIdentifier: appleBundleIdentifiers[0],
			audience:
				appleBundleIdentifiers.length > 0
				? appleBundleIdentifiers
					: undefined,
		},	
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					// Parse full name into firstName and lastName
					const nameParts = user.name?.split(" ") || [];
					const firstName = nameParts[0] || "";
					const lastName = nameParts.slice(1).join(" ") || "";

					return {
						data: {
							...user,
							firstName,
							lastName,
							role: "CUSTOMER", // Default role for all new users
						},
					};
				},
				after: async (user) => {
					// Auto-create customer record for new users
					try {
						await prisma.customer.create({
							data: {
								userId: user.id,
							},
						});
						console.log(`✅ Created customer record for user: ${user.email}`);
					} catch (error) {
						console.error(
							`❌ Failed to create customer for user ${user.email}:`,
							error,
						);
					}
				},
			},
		},
	},
});
