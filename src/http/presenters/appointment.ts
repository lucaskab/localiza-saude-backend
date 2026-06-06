import { toPublicHealthcareProvider } from "@/http/useCases/healthcare-providers/to-public-healthcare-provider";

type PublicUserLike = {
	id: string;
	name: string;
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
	emailVerified?: boolean;
	phone?: string | null;
	image?: string | null;
	role?: string;
	onboardingCompleted?: boolean;
	onboardingStep?: string;
	createdAt?: Date;
	updatedAt?: Date;
};

type PublicCustomerLike = PublicUserLike & {
	cpf?: string | null;
	dateOfBirth?: Date | null;
	primaryAddress?: unknown | null;
};

type PublicHealthcareProviderLike = PublicUserLike & {
	licenseDocumentKey?: unknown;
	verificationStatus?: unknown;
	verificationRejectionReason?: unknown;
	verifiedAt?: unknown;
	verifiedByUserId?: unknown;
	isSuperProfessional?: unknown;
};

type AppointmentLike = {
	customer?: PublicCustomerLike | null;
	healthcareProvider?: PublicHealthcareProviderLike | null;
	cancelledByUser?: PublicUserLike | null;
	recurringSeries?: {
		rules?: unknown[];
		[key: string]: unknown;
	} | null;
	[key: string]: unknown;
};

function toPublicUser<T extends PublicUserLike>(user: T) {
	return {
		id: user.id,
		name: user.name,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		emailVerified: user.emailVerified,
		phone: user.phone,
		image: user.image,
		role: user.role,
		onboardingCompleted: user.onboardingCompleted,
		onboardingStep: user.onboardingStep,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

function toPublicCustomer<T extends PublicCustomerLike>(customer: T) {
	return {
		...toPublicUser(customer),
		cpf: customer.cpf,
		dateOfBirth: customer.dateOfBirth,
		primaryAddress: customer.primaryAddress,
	};
}

export function presentAppointment<T extends AppointmentLike | null>(
	appointment: T,
): T {
	if (!appointment) {
		return appointment;
	}

	const { recurringSeries } = appointment;
	const { rules, ...publicRecurringSeries } = recurringSeries ?? {};

	return {
		...appointment,
		customer: appointment.customer ? toPublicCustomer(appointment.customer) : null,
		healthcareProvider: appointment.healthcareProvider
			? toPublicHealthcareProvider(appointment.healthcareProvider)
			: appointment.healthcareProvider,
		cancelledByUser: appointment.cancelledByUser
			? toPublicUser(appointment.cancelledByUser)
			: null,
		recurringSeries: recurringSeries
			? {
					...publicRecurringSeries,
					weeklySlots: rules ?? [],
				}
			: recurringSeries,
	} as T;
}

export function presentAppointments<T extends AppointmentLike>(
	appointments: T[],
) {
	return appointments.map((appointment) => presentAppointment(appointment));
}
