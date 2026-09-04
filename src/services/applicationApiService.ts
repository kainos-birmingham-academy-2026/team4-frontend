import axios from "axios";
import apiClient from "../config/apiClient";
import type {
	ApplicationResponse,
	ApplicationSummary,
} from "../types/applicationDTO";

export class ApplicationServiceError extends Error {
	constructor(
		message: string,
		public readonly statusCode?: number,
	) {
		super(message);
		this.name = "ApplicationServiceError";
	}
}

export async function submitApplication(
	jobRoleId: number,
	message: string,
	token: string,
): Promise<ApplicationResponse> {
	try {
		const { data } = await apiClient.post<ApplicationResponse>(
			"/api/applications",
			{ jobRoleId, message },
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const apiMessage = error.response?.data?.error;
			if (typeof apiMessage === "string") {
				throw new ApplicationServiceError(apiMessage, status);
			}
			if (status && status >= 500) {
				throw new ApplicationServiceError(
					"Backend server error while submitting your application",
					status,
				);
			}
		}

		throw new ApplicationServiceError(
			"Unable to submit your application. Please try again.",
		);
	}
}

export async function getMyApplications(
	token: string,
): Promise<ApplicationSummary[]> {
	try {
		const { data } = await apiClient.get<{
			applications: ApplicationSummary[];
		}>("/api/applications", { headers: { Authorization: `Bearer ${token}` } });
		return data.applications;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new ApplicationServiceError(
				"Unable to fetch your applications",
				error.response?.status,
			);
		}

		throw new ApplicationServiceError("Unable to fetch your applications");
	}
}
