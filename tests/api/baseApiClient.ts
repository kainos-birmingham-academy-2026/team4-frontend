import type { APIRequestContext, APIResponse } from "@playwright/test";

export class BaseApiClient {
	constructor(
		protected readonly request: APIRequestContext,
		private readonly baseUrl = "",
	) {}

	getHealth(): Promise<APIResponse> {
		return this.request.get("/health");
	}

	resetMockState(): Promise<APIResponse> {
		return this.request.post(`${this.baseUrl}/__test__/reset`);
	}

	login(email: string, password: string): Promise<APIResponse> {
		return this.request.post(`${this.baseUrl}/auth/login`, {
			data: { email, password },
		});
	}

	register(
		email: string,
		password: string,
		confirmPassword?: string,
	): Promise<APIResponse> {
		return this.request.post(`${this.baseUrl}/auth/register`, {
			data: { email, password, confirmPassword: confirmPassword ?? password },
		});
	}

	getJobRoles(query?: Record<string, string>): Promise<APIResponse> {
		return this.request.get(`${this.baseUrl}/api/job-roles`, {
			params: query,
		});
	}

	getJobRole(id: number): Promise<APIResponse> {
		return this.request.get(`${this.baseUrl}/api/job-roles/${id}`);
	}

	createJobRole(payload: Record<string, unknown>): Promise<APIResponse> {
		return this.request.post(`${this.baseUrl}/api/job-roles`, {
			data: payload,
		});
	}

	updateJobRole(
		id: number,
		payload: Record<string, unknown>,
	): Promise<APIResponse> {
		return this.request.put(`${this.baseUrl}/api/job-roles/${id}`, {
			data: payload,
		});
	}

	deleteJobRole(id: number): Promise<APIResponse> {
		return this.request.delete(`${this.baseUrl}/api/job-roles/${id}`);
	}

	getApplicationsByJobRole(id: number): Promise<APIResponse> {
		return this.request.get(`${this.baseUrl}/api/applications/job-role/${id}`);
	}

	assessApplication(
		id: number,
		action: "hire" | "reject",
	): Promise<APIResponse> {
		return this.request.post(
			`${this.baseUrl}/api/applications/${id}/${action}`,
		);
	}
}
