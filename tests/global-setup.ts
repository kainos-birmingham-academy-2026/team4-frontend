import {
	type FullConfig,
	request as playwrightRequest,
} from "@playwright/test";
import { testConfiguration } from "./config/configuration";

export default async function globalSetup(config: FullConfig): Promise<void> {
	const baseURL = config.projects[0]?.use.baseURL ?? testConfiguration.baseURL;
	const requestContext = await playwrightRequest.newContext({ baseURL });
	const response = await requestContext.get("/health");

	if (!response.ok()) {
		throw new Error(
			`Test environment health check failed: ${response.status()}`,
		);
	}

	await requestContext.dispose();
}
