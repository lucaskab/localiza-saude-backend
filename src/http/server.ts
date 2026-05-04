import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { fromNodeHeaders } from "better-auth/node";
import Fastify, { type FastifyReply } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { env } from "@/env";
import { errorHandler } from "@/http/error-handler";
import { startAppointmentReminderWorker } from "@/http/services/appointment-reminder-worker";
import { routerLoader } from "@/loaders/router/router";
import { z } from "zod";

const fastify = Fastify().withTypeProvider<ZodTypeProvider>();

fastify.setSerializerCompiler(serializerCompiler);
fastify.setValidatorCompiler(validatorCompiler);

fastify.setErrorHandler(errorHandler);

const getRequestOrigin = (request: { headers: Record<string, unknown> }) => {
	const forwardedProto = request.headers["x-forwarded-proto"]
		?.toString()
		.split(",")[0]
		?.trim();
	const forwardedHost = request.headers["x-forwarded-host"]
		?.toString()
		.split(",")[0]
		?.trim();
	const protocol = forwardedProto || "http";
	const host = forwardedHost || request.headers.host;

	return `${protocol}://${host}`;
};

const getSetCookieHeaders = (headers: Headers) => {
	const responseHeaders = headers as Headers & {
		getSetCookie?: () => string[];
	};

	return responseHeaders.getSetCookie
		? responseHeaders.getSetCookie()
		: responseHeaders.get("set-cookie")
			? [responseHeaders.get("set-cookie") as string]
			: [];
};

const forwardSetCookieHeaders = (headers: Headers, reply: FastifyReply) => {
	const setCookieHeaders = getSetCookieHeaders(headers);

	if (setCookieHeaders.length > 0) {
		reply.header("set-cookie", setCookieHeaders);
	}
};

const webOAuthCodeBodySchema = z.object({
	code: z.string().min(1),
});

// Configure CORS policies
fastify.register(fastifyCors, {
	origin: [
		"http://localhost:8081",
		"http://localhost:8082",
		"http://localhost:3333",
		"http://localhost:5173",
		"http://localhost:5174",
		"http://127.0.0.1:5173",
		"http://127.0.0.1:5174",
		...(env.WEB_APP_URL ? [env.WEB_APP_URL] : []),
		"https://localiza-saude-web.onrender.com",
		"https://localiza-saude-backend-development.onrender.com",
		"http://192.168.1.108:3333",
		/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:517\d$/,
		/^exp:\/\/.*$/,
		/^localizasaude:\/\/.*$/,
	],
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86400,
});

// Register multipart for file uploads
fastify.register(fastifyMultipart, {
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
	},
});

fastify.get("/auth/google", async (request, reply) => {
	try {
		const query = request.query as { callbackURL?: string };
		const webRedirectURL =
			query.callbackURL ??
			(env.WEB_APP_URL ? `${env.WEB_APP_URL}/auth/callback` : undefined);
		const callbackURL = new URL("/auth/google/callback", getRequestOrigin(request));

		if (webRedirectURL) {
			callbackURL.searchParams.set("redirectURL", webRedirectURL);
		}

		const headers = fromNodeHeaders(request.headers);
		headers.set("content-type", "application/json");

		const response = await auth.handler(
			new Request(`${getRequestOrigin(request)}/api/auth/sign-in/social`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					provider: "google",
					callbackURL: callbackURL.toString(),
				}),
			}),
		);

		forwardSetCookieHeaders(response.headers, reply);

		const body = response.body ? await response.json() : null;
		const googleRedirectURL =
			response.headers.get("location") ??
			(typeof body === "object" &&
			body !== null &&
			"url" in body &&
			typeof body.url === "string"
				? body.url
				: null);

		if (!response.ok || !googleRedirectURL) {
			reply.status(response.status).send(body);
			return;
		}

		reply.redirect(googleRedirectURL);
	} catch (error) {
		fastify.log.error(error, "Google authentication redirect error");
		reply.status(500).send({
			error: "Internal Google authentication redirect error",
			code: "GOOGLE_AUTH_REDIRECT_FAILURE",
		});
	}
});

fastify.get("/auth/google/callback", async (request, reply) => {
	try {
		const query = request.query as {
			redirectURL?: string;
			error?: string;
		};
		const redirectURL = query.redirectURL ?? env.WEB_APP_URL;

		if (!redirectURL) {
			reply.status(400).send({
				error: "Missing redirect URL",
				code: "MISSING_REDIRECT_URL",
			});
			return;
		}

		const url = new URL(redirectURL);

		if (query.error) {
			url.searchParams.set("error", query.error);
			reply.redirect(url.toString());
			return;
		}

		const response = await auth.handler(
			new Request(`${getRequestOrigin(request)}/api/auth/get-session`, {
				method: "GET",
				headers: fromNodeHeaders(request.headers),
			}),
		);
		const sessionPayload = response.body ? await response.json() : null;
		const session =
			typeof sessionPayload === "object" &&
			sessionPayload !== null &&
			"session" in sessionPayload
				? sessionPayload.session
				: null;
		const sessionToken =
			typeof session === "object" &&
			session !== null &&
			"token" in session &&
			typeof session.token === "string"
				? session.token
				: null;

		if (!sessionToken) {
			url.searchParams.set("error", "session");
			reply.redirect(url.toString());
			return;
		}

		const code = crypto.randomUUID();

		await prisma.verification.create({
			data: {
				identifier: `web-oauth:${code}`,
				value: JSON.stringify({ sessionToken }),
				expiresAt: new Date(Date.now() + 2 * 60 * 1000),
			},
		});

		url.searchParams.set("code", code);
		reply.redirect(url.toString());
	} catch (error) {
		fastify.log.error(error, "Google authentication callback bridge error");
		reply.status(500).send({
			error: "Internal Google authentication callback bridge error",
			code: "GOOGLE_AUTH_CALLBACK_BRIDGE_FAILURE",
		});
	}
});

fastify.post("/auth/web/exchange", async (request, reply) => {
	try {
		const { code } = webOAuthCodeBodySchema.parse(request.body);
		const identifier = `web-oauth:${code}`;
		const verification = await prisma.verification.findFirst({
			where: { identifier },
		});

		await prisma.verification.deleteMany({
			where: { identifier },
		});

		if (!verification || verification.expiresAt < new Date()) {
			reply.status(401).send({
				error: "Invalid or expired OAuth code",
				code: "INVALID_OAUTH_CODE",
			});
			return;
		}

		const { sessionToken } = z
			.object({
				sessionToken: z.string().min(1),
			})
			.parse(JSON.parse(verification.value));
		const session = await prisma.session.findUnique({
			where: { token: sessionToken },
			include: { user: true },
		});

		if (!session || session.expiresAt < new Date()) {
			reply.status(401).send({
				error: "Invalid or expired session",
				code: "INVALID_SESSION",
			});
			return;
		}

		reply.send({
			sessionToken: session.token,
			user: session.user,
		});
	} catch (error) {
		fastify.log.error(error, "Google authentication code exchange error");
		reply.status(400).send({
			error: "Invalid Google authentication code exchange request",
			code: "GOOGLE_AUTH_CODE_EXCHANGE_FAILURE",
		});
	}
});

// Register authentication endpoint
fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			// Construct request URL
			const url = new URL(request.url, getRequestOrigin(request));

			// Convert Fastify headers to standard Headers object
			const headers = fromNodeHeaders(request.headers);

			// Create Fetch API-compatible request
			const req = new Request(url.toString(), {
				method: request.method,
				headers,
				...(request.body ? { body: JSON.stringify(request.body) } : {}),
			});

			// Process authentication request
			const response = await auth.handler(req);

			// Forward response to client
			reply.status(response.status);
			response.headers.forEach((value, key) => {
				if (key.toLowerCase() === "set-cookie") {
					return;
				}

				reply.header(key, value);
			});

			forwardSetCookieHeaders(response.headers, reply);

			reply.send(response.body ? await response.text() : null);
		} catch (error) {
			fastify.log.error(error, "Authentication Error");
			reply.status(500).send({
				error: "Internal authentication error",
				code: "AUTH_FAILURE",
			});
		}
	},
});

// Load and register all routes
routerLoader()
	.loadRoutes(fastify)
	.then(() => {
		// Log all registered routes
		console.log("\n📋 Registered Routes:");
		console.log(fastify.printRoutes());

		// Initialize server
		fastify.listen({ port: 3333, host: "0.0.0.0" }, (err) => {
			if (err) {
				fastify.log.error(err);
				process.exit(1);
			}
			console.log("\n✅ Server running on http://localhost:3333\n");
			startAppointmentReminderWorker();
		});
	});

export { fastify as app };
