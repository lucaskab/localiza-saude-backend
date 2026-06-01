import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { Prisma } from "../../../prisma/generated/prisma/client";

export type HealthInsurancePlanSummary = {
	id: string;
	name: string;
};

type PlanLink = {
	healthInsurancePlan: HealthInsurancePlanSummary;
};

export function mapHealthInsurancePlans(
	links: PlanLink[] | undefined,
): HealthInsurancePlanSummary[] {
	return (links ?? []).map((link) => ({
		id: link.healthInsurancePlan.id,
		name: link.healthInsurancePlan.name,
	}));
}

export async function listActiveHealthInsurancePlans(): Promise<
	HealthInsurancePlanSummary[]
> {
	const plans = await prisma.health_insurance_plan.findMany({
		where: { active: true },
		orderBy: { name: "asc" },
		select: {
			id: true,
			name: true,
		},
	});

	return plans;
}

async function assertHealthInsurancePlanIdsExist(planIds: string[]) {
	if (planIds.length === 0) {
		return;
	}

	const uniquePlanIds = [...new Set(planIds)];
	const plans = await prisma.health_insurance_plan.findMany({
		where: {
			id: { in: uniquePlanIds },
			active: true,
		},
		select: { id: true },
	});

	if (plans.length !== uniquePlanIds.length) {
		throw new BadRequestError("One or more health insurance plans are invalid");
	}
}

export async function replaceUserHealthInsurancePlans(
	tx: Prisma.TransactionClient,
	userId: string,
	planIds: string[] | undefined,
) {
	if (planIds === undefined) {
		return;
	}

	const uniquePlanIds = [...new Set(planIds)];
	await assertHealthInsurancePlanIdsExist(uniquePlanIds);

	await tx.user_health_insurance_plan.deleteMany({
		where: { userId },
	});

	if (uniquePlanIds.length === 0) {
		return;
	}

	await tx.user_health_insurance_plan.createMany({
		data: uniquePlanIds.map((healthInsurancePlanId) => ({
			userId,
			healthInsurancePlanId,
		})),
	});
}

export async function replaceProviderAcceptedHealthInsurancePlans(
	tx: Prisma.TransactionClient,
	healthcareProviderId: string,
	planIds: string[] | undefined,
) {
	if (planIds === undefined) {
		return;
	}

	const uniquePlanIds = [...new Set(planIds)];
	await assertHealthInsurancePlanIdsExist(uniquePlanIds);

	await tx.healthcare_provider_health_insurance_plan.deleteMany({
		where: { healthcareProviderId },
	});

	if (uniquePlanIds.length === 0) {
		return;
	}

	await tx.healthcare_provider_health_insurance_plan.createMany({
		data: uniquePlanIds.map((healthInsurancePlanId) => ({
			healthcareProviderId,
			healthInsurancePlanId,
		})),
	});
}

export async function findUserHealthInsurancePlans(userId: string) {
	const links = await prisma.user_health_insurance_plan.findMany({
		where: { userId },
		include: {
			healthInsurancePlan: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: {
			healthInsurancePlan: {
				name: "asc",
			},
		},
	});

	return mapHealthInsurancePlans(links);
}
