import { defineConfig } from "@playwright/test";
import { testConfiguration } from "./tests/config/configuration";

export default defineConfig({
	testDir: "./tests",
	testMatch: ["**/*.spec.ts"],
	globalSetup: "./tests/global-setup.ts",
	globalTeardown: "./tests/global-teardown.ts",
	use: {
		baseURL: testConfiguration.baseURL,
		trace: "retain-on-failure",
	},
	...(testConfiguration.environment === "local"
		? {
				webServer: {
					command: "NODE_ENV=production tsx src/server.ts",
					url: "http://127.0.0.1:3000/health",
					reuseExistingServer: true,
				},
			}
		: {}),
});
