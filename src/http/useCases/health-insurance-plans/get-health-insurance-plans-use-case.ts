import { listActiveHealthInsurancePlans } from "@/http/services/health-insurance-plans";
import type { GetHealthInsurancePlansResponseSchema } from "@/schemas/routes/health-insurance-plans/get-health-insurance-plans";

export const getHealthInsurancePlansUseCase = {
	async execute(): Promise<GetHealthInsurancePlansResponseSchema> {
		const healthInsurancePlans = await listActiveHealthInsurancePlans();

		return { healthInsurancePlans };
	},
};
