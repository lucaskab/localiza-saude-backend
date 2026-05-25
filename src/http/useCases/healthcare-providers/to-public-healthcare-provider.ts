type VerificationFields = {
	verificationStatus?: unknown;
	verificationRejectionReason?: unknown;
	verifiedAt?: unknown;
	verifiedByUserId?: unknown;
	isSuperProfessional?: unknown;
};

export type PublicHealthcareProvider<T extends VerificationFields> = Omit<
	T,
	| "verificationStatus"
	| "verificationRejectionReason"
	| "verifiedAt"
	| "verifiedByUserId"
	| "isSuperProfessional"
>;

export function toPublicHealthcareProvider<T extends VerificationFields>(
	provider: T,
): PublicHealthcareProvider<T> {
	const {
		verificationStatus: _verificationStatus,
		verificationRejectionReason: _verificationRejectionReason,
		verifiedAt: _verifiedAt,
		verifiedByUserId: _verifiedByUserId,
		isSuperProfessional: _isSuperProfessional,
		...publicProvider
	} = provider;

	return publicProvider;
}
