import type { APIRequestContext, APIResponse } from "@playwright/test";

export class BaseApiClient {
	constructor(protected readonly request: APIRequestContext) {}

	getHealth(): Promise<APIResponse> {
		return this.request.get("/health");
	}
}
