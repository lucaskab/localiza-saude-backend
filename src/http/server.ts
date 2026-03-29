import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { auth } from "@/auth";
import { errorHandler } from "@/http/error-handler";
import { routerLoader } from "@/loaders/router/router";

const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

fastify.setSerializerCompiler(serializerCompiler);
fastify.setValidatorCompiler(validatorCompiler);

fastify.setErrorHandler(errorHandler);

// Configure CORS policies
fastify.register(fastifyCors, {
	origin: [
		"http://localhost:8081",
		"http://localhost:8082",
		"http://localhost:3333",
		/^exp:\/\/.*$/,
		/^localizasaude:\/\/.*$/,
	],
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86400,
});

// Register authentication endpoint
fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			// Construct request URL
			const url = new URL(request.url, `http://${request.headers.host}`);

			// Convert Fastify headers to standard Headers object
			const headers = new Headers();
			Object.entries(request.headers).forEach(([key, value]) => {
				if (value) headers.append(key, value.toString());
			});

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
				reply.header(key, value);
			});
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
		// Initialize server
		fastify.listen({ port: 3333, host: "0.0.0.0" }, (err) => {
			if (err) {
				fastify.log.error(err);
				process.exit(1);
			}
			console.log("Server running on http://localhost:3333");
		});
	});

export { fastify as app };
