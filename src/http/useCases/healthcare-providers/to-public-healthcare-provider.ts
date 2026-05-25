type VerificationFields = {
	verificationStatus?: unknown;
	verificationRejectionReason?: unknown;
	verifiedAt?: unknown;
	verifiedByUserId?: unknown;
	isSuperProfessional?: unknown;
};

export function toPublicHealthcareProvider<T extends VerificationFields>(
	provider: T,
): Omit<
	T,
	| "verificationStatus"
	| "verificationRejectionReason"
	| "verifiedAt"
	| "verifiedByUserId"
	| "isSuperProfessional"
> {
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
