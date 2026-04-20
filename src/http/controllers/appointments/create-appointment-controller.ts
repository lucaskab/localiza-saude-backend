import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { createAppointmentUseCase } from "@/http/useCases/appointments/create-appointment-use-case";
import type { CreateAppointmentBodySchema } from "@/schemas/routes/appointments/create-appointment";

export const createAppointmentController = {
	async handle(
		request: FastifyRequest<{ Body: CreateAppointmentBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();

		const customer = await prisma.customer.findUnique({
			where: { userId: user.id },
		});

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const result = await createAppointmentUseCase.execute({
			...request.body,
			customerId: customer.id,
		});

		return reply.status(201).send(result);
	},
};
