import type { FastifyReply, FastifyRequest } from "fastify";
import { getNearbyClinicsUseCase } from "@/http/useCases/clinics/get-nearby-clinics-use-case";
import type { GetNearbyClinicsQuerySchema } from "@/schemas/routes/clinics/get-nearby-clinics";

export const getNearbyClinicsController = {
	async handle(
		request: FastifyRequest<{ Querystring: GetNearbyClinicsQuerySchema }>,
		reply: FastifyReply,
	) {
		const { latitude, longitude, radiusInKm } = request.query;

		const result = await getNearbyClinicsUseCase.execute({
			latitude,
			longitude,
			radiusInKm,
		});

		return reply.status(200).send(result);
	},
};
