import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getHealthInsurancePlansController } from "@/http/controllers/health-insurance-plans/get-health-insurance-plans-controller";
import { getHealthInsurancePlansRouteOptions } from "@/schemas/routes/health-insurance-plans/get-health-insurance-plans";

const getHealthInsurancePlans = (app: FastifyInstance) => {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/health-insurance-plans",
		getHealthInsurancePlansRouteOptions,
		getHealthInsurancePlansController.handle,
	);
};

export default getHealthInsurancePlans;
