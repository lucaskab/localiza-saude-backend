import type { FastifyReply, FastifyRequest } from "fastify";
import { getTimeSlotsUseCase } from "@/http/useCases/healthcare-providers/get-time-slots-use-case";
import type {
	GetTimeSlotsParamsSchema,
	GetTimeSlotsQuerySchema,
} from "@/schemas/routes/healthcare-providers/get-time-slots";

export const getTimeSlotsController = {
	async handle(
		request: FastifyRequest<{
			Params: GetTimeSlotsParamsSchema;
			Querystring: GetTimeSlotsQuerySchema;
		}>,
		reply: FastifyReply,
	) {
		console.log("🎯 Time Slots Controller Hit!");
		console.log("URL:", request.url);
		console.log("Query raw:", request.query);
		console.log("Params:", request.params);

		const { healthcareProviderId } = request.params;
		const { date, procedureIds } = request.query;

		console.log("procedureIds value:", procedureIds);
		console.log("procedureIds type:", typeof procedureIds);

		// Parse procedureIds from comma-separated string to array
		const procedureIdsArray = procedureIds
			.split(",")
			.map((id) => id.trim())
			.filter((id) => id.length > 0);

		console.log("procedureIds array:", procedureIdsArray);

		const result = await getTimeSlotsUseCase.execute({
			healthcareProviderId,
			date,
			procedureIds: procedureIdsArray,
		});

		return reply.status(200).send(result);
	},
};
