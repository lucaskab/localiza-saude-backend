import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const deleteCustomerUseCase = {
	async execute(id: string): Promise<{ message: string }> {
		const existingCustomer = await prismaCustomerRepository.findById(id);

		if (!existingCustomer) {
			throw new BadRequestError("Customer not found");
		}

		await prismaCustomerRepository.delete(id);

		return { message: "Customer deleted successfully" };
	},
};
