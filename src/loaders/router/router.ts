import path from "node:path";
import url from "node:url";
import type { FastifyInstance } from "fastify";
import { glob } from "glob";

export const routerLoader = () => {
	return {
		async loadRoutes(app: FastifyInstance) {
			const routesPath = path.resolve(
				path.dirname(""),
				"src",
				"http",
				"routes",
				"**",
				"!(_*)",
				"*.ts",
			);

			const routes = await glob(routesPath, {
				windowsPathsNoEscape: true,
			});

			for (const route of routes) {
				const urlRoute = url.pathToFileURL(route).toString();
				const routeDefinition = await import(urlRoute);
				app.register(routeDefinition.default);
			}
		},
	};
};
