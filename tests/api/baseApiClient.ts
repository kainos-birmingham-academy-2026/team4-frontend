import type { APIRequestContext, APIResponse } from "@playwright/test";

export class BaseApiClient {
	constructor(
		protected readonly request: APIRequestContext,
		private readonly baseUrl = "",
	) {}

	getHealth(): Promise<APIResponse> {
		return this.request.get("/health");
	}

	getJobRoles(query?: Record<string, string>): Promise<APIResponse> {
		return this.request.get(`${this.baseUrl}/api/job-roles`, {
			params: query,
		});
	}

	getJobRole(id: number): Promise<APIResponse> {
		return this.request.get(`${this.baseUrl}/api/job-roles/${id}`);
	}
}
