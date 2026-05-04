import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { fromNodeHeaders } from "better-auth/node";
import Fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { auth } from "@/auth";
import { env } from "@/env";
import { errorHandler } from "@/http/error-handler";
import { startAppointmentReminderWorker } from "@/http/services/appointment-reminder-worker";
import { routerLoader } from "@/loaders/router/router";

const fastify = Fastify().withTypeProvider<ZodTypeProvider>();

fastify.setSerializerCompiler(serializerCompiler);
fastify.setValidatorCompiler(validatorCompiler);

fastify.setErrorHandler(errorHandler);

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

// Register authentication endpoint
fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			// Construct request URL
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
			const url = new URL(request.url, `${protocol}://${host}`);

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

			const responseHeaders = response.headers as Headers & {
				getSetCookie?: () => string[];
			};
			const setCookieHeaders = responseHeaders.getSetCookie
				? responseHeaders.getSetCookie()
				: responseHeaders.get("set-cookie")
					? [responseHeaders.get("set-cookie") as string]
					: [];

			if (setCookieHeaders.length > 0) {
				reply.header("set-cookie", setCookieHeaders);
			}

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
