import process from "node:process";

export type TestEnvironment = "local" | "staging" | "production";

const environment = (process.env.TEST_ENV ?? "local") as TestEnvironment;
const urls: Partial<Record<TestEnvironment, string>> = {
	local: "http://127.0.0.1:3000",
	staging: process.env.STAGING_BASE_URL,
	production: process.env.PRODUCTION_BASE_URL,
};

if (!(environment in urls) || !urls[environment]) {
	throw new Error(
		`Set a valid TEST_ENV and matching base URL. Use local, or provide STAGING_BASE_URL/PRODUCTION_BASE_URL.`,
	);
}

export const testConfiguration = {
	environment,
	baseURL: process.env.PLAYWRIGHT_BASE_URL ?? urls[environment]!,
};
