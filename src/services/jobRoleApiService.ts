import axios from "axios";
import apiClient from "../config/apiClient";
import type { JobRole } from "../models/jobRole";
import type { PaginatedResponse } from "../types/jobRoleDTO";

function authHeaders(token: string): { Authorization: string } {
	return { Authorization: `Bearer ${token}` };
}

export async function getAllJobRoles(
	token: string,
): Promise<JobRole[] | undefined> {
	try {
		const { data } = await apiClient.get<JobRole[]>("/api/job-roles", {
			headers: authHeaders(token),
		});
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { status } = error.response || {};
			if (!status) throw error;

			if (status === 404) {
				throw new Error("Job roles not found.");
			} else if (status >= 500) {
				throw new Error(`Error fetching job roles: ${error.message}`);
			} else {
				throw new Error(`Unexpected error: ${error.message}`);
			}
		}
	}
}

export async function getJobRoleById(
	id: number,
	token: string,
): Promise<JobRole | undefined> {
	try {
		const { data } = await apiClient.get<JobRole>(`/api/job-roles/${id}`, {
			headers: authHeaders(token),
		});
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { status } = error.response || {};
			if (!status) throw error;

			if (status === 404) {
				throw new Error("Job role not found.");
			} else if (status >= 500) {
				throw new Error(`Error fetching job role: ${error.message}`);
			} else {
				throw new Error(`Unexpected error: ${error.message}`);
			}
		}
	}
}

export async function getPaginatedJobRoles(
	page: number = 1,
	token: string,
): Promise<PaginatedResponse | undefined> {
	try {
		const { data } = await apiClient.get<PaginatedResponse>("/api/job-roles", {
			params: { page },
			headers: authHeaders(token),
		});
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { status } = error.response || {};
			if (!status) throw error;

			if (status === 404) {
				throw new Error("Job roles not found.");
			} else if (status >= 500) {
				throw new Error(`Error fetching paginated job roles: ${error.message}`);
			} else {
				throw new Error(`Unexpected error: ${error.message}`);
			}
		}
	}
}

export async function createJobRole(
	jobRoleData: Omit<JobRole, "id">,
	token: string,
): Promise<JobRole | undefined> {
	try {
		const { data } = await apiClient.post<JobRole>(
			"/api/job-roles",
			jobRoleData,
			{ headers: authHeaders(token) },
		);
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { status } = error.response || {};
			if (!status) throw error;

			if (status === 400) {
				throw new Error("Invalid job role data.");
			} else if (status === 401) {
				throw new Error("Unauthorized");
			} else if (status === 403) {
				throw new Error("Forbidden");
			} else if (status >= 500) {
				throw new Error(`Error creating job role: ${error.message}`);
			} else {
				throw new Error(`Unexpected error: ${error.message}`);
			}
		}
	}
}

export async function updateJobRole(
	id: number,
	jobRoleData: Partial<Omit<JobRole, "id">>,
	token: string,
): Promise<JobRole | undefined> {
	try {
		const { data } = await apiClient.put<JobRole>(
			`/api/job-roles/${id}`,
			jobRoleData,
			{ headers: authHeaders(token) },
		);
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { status } = error.response || {};
			if (!status) throw error;

			if (status === 400) {
				throw new Error("Invalid job role data.");
			} else if (status === 401) {
				throw new Error("Unauthorized");
			} else if (status === 403) {
				throw new Error("Forbidden");
			} else if (status === 404) {
				throw new Error("Job role not found.");
			} else if (status >= 500) {
				throw new Error(`Error updating job role: ${error.message}`);
			} else {
				throw new Error(`Unexpected error: ${error.message}`);
			}
		}
	}
}

export async function deleteJobRole(id: number, token: string): Promise<void> {
	try {
		await apiClient.delete(`/api/job-roles/${id}`, {
			headers: authHeaders(token),
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { status } = error.response || {};
			if (!status) throw error;

			if (status === 401) {
				throw new Error("Unauthorized");
			} else if (status === 403) {
				throw new Error("Forbidden");
			} else if (status === 404) {
				throw new Error("Job role not found.");
			} else if (status >= 500) {
				throw new Error(`Error deleting job role: ${error.message}`);
			} else {
				throw new Error(`Unexpected error: ${error.message}`);
			}
		}
	}
}
