import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "@/database/prisma";
import { env } from "@/env";
import { emailService } from "@/http/services/email.service";

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

export const GOOGLE_CALENDAR_SCOPES = [
	"https://www.googleapis.com/auth/calendar.events",
] as const;

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	basePath: "/api/auth",
	secret: env.BETTER_AUTH_SECRET,
	plugins: [expo(), openAPI()],
	trustedOrigins: [
		"http://localhost:8081",
		"http://localhost:8082",
		"http://localhost:3333",
		env.BETTER_AUTH_URL,
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
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url, token }) => {
			void emailService.send({
				to: user.email,
				subject: "Redefina sua senha da Localiza Saúde",
				html: `
					<p>Olá${user.name ? `, ${user.name}` : ""}.</p>
					<p>Recebemos uma solicitação para redefinir a senha da sua conta na Localiza Saúde.</p>
					<p>
						<a href="${url}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
							Redefinir senha
						</a>
					</p>
					<p>Se você não solicitou essa alteração, ignore este email.</p>
				`,
				text: `Redefina sua senha da Localiza Saúde: ${url}`,
				idempotencyKey: `password-reset-${user.id}-${token}`,
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
		expiresIn: 60 * 60 * 24,
		sendVerificationEmail: async ({ user, url, token }) => {
			void emailService.send({
				to: user.email,
				subject: "Confirme seu email na Localiza Saúde",
				html: `
					<p>Olá${user.name ? `, ${user.name}` : ""}.</p>
					<p>Confirme seu email para ativar sua conta na Localiza Saúde.</p>
					<p>
						<a href="${url}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
							Confirmar email
						</a>
					</p>
					<p>Depois da confirmação, você poderá escolher se quer usar a plataforma como paciente ou profissional.</p>
					<p>Se você não criou esta conta, ignore este email.</p>
				`,
				text: `Confirme seu email na Localiza Saúde: ${url}`,
				idempotencyKey: `email-verification-${user.id}-${token}`,
			});
		},
	},
	advanced: {
		...(process.env.NODE_ENV === "production"
			? {
					defaultCookieAttributes: {
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
			onboardingCompleted: {
				type: "boolean",
				required: true,
				defaultValue: true,
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
			accessType: "offline",
			prompt: "select_account consent",
			scope: [...GOOGLE_CALENDAR_SCOPES],
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
							role: "CUSTOMER",
							onboardingCompleted: false,
						},
					};
				},
			},
		},
	},
});
