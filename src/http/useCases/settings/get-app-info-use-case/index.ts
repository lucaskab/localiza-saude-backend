export const getAppInfoUseCase = {
	async execute() {
		return {
			app: {
				name: "Localiza Saúde",
				apiVersion: process.env.npm_package_version || "1.0.0",
				environment: process.env.NODE_ENV || "development",
				serverTime: new Date(),
			},
		};
	},
};
