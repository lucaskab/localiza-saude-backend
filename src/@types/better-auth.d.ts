import type { UserRole } from "../../prisma/generated/prisma/client";

declare module "better-auth" {
	interface User {
		role: UserRole;
		onboardingCompleted: boolean;
		onboardingStep?:
			| "ROLE"
			| "CUSTOMER_PROFILE"
			| "CUSTOMER_MEDICAL"
			| "COMPLETED";
		firstName?: string | null;
		lastName?: string | null;
		phone?: string | null;
	}

	interface Session {
		user: User;
	}
}

export {};
