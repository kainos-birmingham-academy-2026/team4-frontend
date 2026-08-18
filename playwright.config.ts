import { defineConfig } from "@playwright/test";
import { testConfiguration } from "./tests/config/configuration";

const localFrontendUrl = "http://127.0.0.1:3001";

export default defineConfig({
	testDir: "./tests",
	testMatch: ["**/*.spec.ts"],
	globalSetup: "./tests/global-setup.ts",
	globalTeardown: "./tests/global-teardown.ts",
	use: {
		baseURL:
			testConfiguration.environment === "local"
				? localFrontendUrl
				: testConfiguration.baseURL,
		trace: "retain-on-failure",
	},
	...(testConfiguration.environment === "local"
		? {
				webServer: [
					{
						command: "tsx tests/support/mockJobRoleApi.ts",
						url: "http://127.0.0.1:4001/api/job-roles",
						reuseExistingServer: true,
					},
					{
						command:
							"PORT=3001 NODE_ENV=test API_BASE_URL=http://127.0.0.1:4001 tsx src/server.ts",
						url: `${localFrontendUrl}/health`,
						reuseExistingServer: true,
					},
				],
			}
		: {}),
});
