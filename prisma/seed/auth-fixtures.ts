import type { SeedClient, SeedUsers } from "./types";

export async function seedAuthFixtures(prisma: SeedClient, users: SeedUsers) {
	console.log("🔑 Seeding Better Auth fixture rows...");

	const authUsers = [
		users.providers.ana,
		users.providers.marina,
		users.staff.recepcaoPaulista,
		users.staff.agendaPinheiros,
	];

	await prisma.account.createMany({
		data: authUsers.map((user) => ({
			accountId: `seed-google-${user.id}`,
			providerId: "seed-google",
			userId: user.id,
			scope: "openid email profile",
			accessToken: `seed-access-token-${user.id}`,
			refreshToken: `seed-refresh-token-${user.id}`,
			accessTokenExpiresAt: new Date("2026-06-01T00:00:00.000Z"),
			refreshTokenExpiresAt: new Date("2026-12-01T00:00:00.000Z"),
		})),
	});

	await prisma.session.createMany({
		data: authUsers.map((user, index) => ({
			token: `seed-session-${user.id}`,
			userId: user.id,
			expiresAt: new Date(
				`2026-06-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
			),
			ipAddress: "127.0.0.1",
			userAgent: "seed/auth-fixture",
		})),
	});

	await prisma.verification.createMany({
		data: [
			{
				identifier: "seed:email-verification",
				value: "seed-email-code-123456",
				expiresAt: new Date("2026-06-01T12:00:00.000Z"),
			},
			{
				identifier: "seed:oauth-state",
				value: "seed-oauth-state-value",
				expiresAt: new Date("2026-06-01T12:05:00.000Z"),
			},
		],
	});

	console.log("✅ Created seed accounts, sessions and verification rows");
}
