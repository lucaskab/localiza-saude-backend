import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { clinicEmployeesController } from "@/http/controllers/clinics/clinic-employees-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import {
	deleteClinicEmployeeRouteOptions,
	getClinicEmployeesRouteOptions,
	updateClinicEmployeeRouteOptions,
	upsertClinicEmployeeRouteOptions,
} from "@/schemas/routes/clinics/clinic-employees";

const clinicEmployees = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/clinics/:clinicId/employees",
			getClinicEmployeesRouteOptions,
			clinicEmployeesController.list,
		)
		.post(
			"/clinics/:clinicId/employees",
			upsertClinicEmployeeRouteOptions,
			clinicEmployeesController.upsert,
		)
		.patch(
			"/clinics/:clinicId/employees/:userId",
			updateClinicEmployeeRouteOptions,
			clinicEmployeesController.update,
		)
		.delete(
			"/clinics/:clinicId/employees/:userId",
			deleteClinicEmployeeRouteOptions,
			clinicEmployeesController.remove,
		);
};

export default clinicEmployees;
