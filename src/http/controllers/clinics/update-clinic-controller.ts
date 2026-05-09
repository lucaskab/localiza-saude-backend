import type { FastifyReply, FastifyRequest } from "fastify";
import { updateClinicUseCase } from "@/http/useCases/clinics/update-clinic-use-case";
import type {
	UpdateClinicBodySchema,
	UpdateClinicParamsSchema,
} from "@/schemas/routes/clinics/update-clinic";

export const updateClinicController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateClinicParamsSchema;
			Body: UpdateClinicBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { id } = request.params;
		const data = request.body;

		const result = await updateClinicUseCase.execute(user, id, data);

		return reply.status(200).send(result);
	},
};
