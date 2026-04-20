import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { prisma } from "@/database/prisma";
import { UnauthorizedError } from "../routes/_errors/unauthorized-error";

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
	app.addHook("preHandler", async (request) => {
		request.getCurrentUserId = async () => {
			try {
				// Get token from Authorization header
				const authHeader = request.headers.authorization;

				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					throw new UnauthorizedError(
						"Missing or invalid authorization header",
					);
				}

				const token = authHeader.replace("Bearer ", "");

				// Verify session directly from database
				const session = await prisma.session.findUnique({
					where: {
						token: token,
					},
					include: {
						user: true,
					},
				});

				if (!session) {
					throw new UnauthorizedError("Invalid or expired session");
				}

				// Check if session has expired
				if (session.expiresAt < new Date()) {
					throw new UnauthorizedError("Invalid or expired session");
				}

				return session.userId;
			} catch (error) {
				if (error instanceof UnauthorizedError) {
					throw error;
				}
				throw new UnauthorizedError("Invalid auth token");
			}
		};

		request.getCurrentUser = async () => {
			try {
				const authHeader = request.headers.authorization;

				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					throw new UnauthorizedError(
						"Missing or invalid authorization header",
					);
				}

				const token = authHeader.replace("Bearer ", "");

				// Verify session directly from database
				const session = await prisma.session.findUnique({
					where: {
						token: token,
					},
					include: {
						user: true,
					},
				});

				if (!session) {
					throw new UnauthorizedError("Invalid or expired session");
				}

				// Check if session has expired
				if (session.expiresAt < new Date()) {
					throw new UnauthorizedError("Invalid or expired session");
				}

				// Fetch full user from database
				const user = await prisma.user.findUnique({
					where: {
						id: session.userId,
					},
				});

				if (!user) {
					throw new UnauthorizedError("User not found");
				}

				return user;
			} catch (error) {
				if (error instanceof UnauthorizedError) {
					throw error;
				}
				throw new UnauthorizedError("Invalid auth token");
			}
		};
	});
});
