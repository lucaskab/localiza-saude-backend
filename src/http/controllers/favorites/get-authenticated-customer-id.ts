import type { FastifyRequest } from "fastify";
import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export async function getAuthenticatedCustomerId(request: FastifyRequest) {
	const user = await request.getCurrentUser();
	const customer = await prisma.customer.findUnique({
		where: { userId: user.id },
		select: { id: true },
	});

	if (!customer) {
		throw new BadRequestError("User is not registered as a customer");
	}

	return customer.id;
}
