import type { UserRole } from "../../prisma/generated/prisma/client";

declare module "better-auth" {
	interface User {
		role: UserRole;
		onboardingCompleted: boolean;
		firstName?: string | null;
		lastName?: string | null;
		phone?: string | null;
	}

	interface Session {
		user: User;
	}
}

export {};
