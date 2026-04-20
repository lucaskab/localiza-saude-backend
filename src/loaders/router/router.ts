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

			console.log(`\n🔍 Found ${routes.length} route files:`);

			for (const route of routes) {
				const urlRoute = url.pathToFileURL(route).toString();
				const routeDefinition = await import(urlRoute);

				// Log each route file being loaded
				const fileName = route.split("/").pop();
				console.log(`  ✓ Loading: ${fileName}`);

				app.register(routeDefinition.default);
			}

			console.log("✅ All routes loaded\n");
		},
	};
};
