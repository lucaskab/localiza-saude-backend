import type { FastifyReply, FastifyRequest } from "fastify";
import { clinicEmployeesUseCase } from "@/http/useCases/clinics/clinic-employees-use-case";
import type {
	ClinicEmployeeParamsSchema,
	ClinicEmployeeUserParamsSchema,
	UpdateClinicEmployeeBodySchema,
	UpsertClinicEmployeeBodySchema,
} from "@/schemas/routes/clinics/clinic-employees";

export const clinicEmployeesController = {
	async list(
		request: FastifyRequest<{ Params: ClinicEmployeeParamsSchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { clinicId } = request.params;
		const result = await clinicEmployeesUseCase.list(user, clinicId);

		return reply.status(200).send(result);
	},

	async upsert(
		request: FastifyRequest<{
			Params: ClinicEmployeeParamsSchema;
			Body: UpsertClinicEmployeeBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { clinicId } = request.params;
		const result = await clinicEmployeesUseCase.upsert(
			user,
			clinicId,
			request.body,
		);

		return reply.status(200).send(result);
	},

	async update(
		request: FastifyRequest<{
			Params: ClinicEmployeeUserParamsSchema;
			Body: UpdateClinicEmployeeBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { clinicId, userId } = request.params;
		const result = await clinicEmployeesUseCase.update(
			user,
			clinicId,
			userId,
			request.body,
		);

		return reply.status(200).send(result);
	},

	async remove(
		request: FastifyRequest<{ Params: ClinicEmployeeUserParamsSchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { clinicId, userId } = request.params;
		const result = await clinicEmployeesUseCase.remove(user, clinicId, userId);

		return reply.status(200).send(result);
	},
};
