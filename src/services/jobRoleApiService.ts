import axios from "axios";
import apiClient from "../config/apiClient";
import type {
	CreateJobRoleInput,
	CreateJobRoleOptions,
	FilterOptions,
	JobRole,
	JobRoleDetail,
	JobRoleFilters,
	JobRoleOrdering,
	PaginatedResponse,
	UpdateJobRoleInput,
} from "../types/jobRoleDTO";

function authHeaders(token: string): { Authorization: string } {
	return { Authorization: `Bearer ${token}` };
}

function toRequestParams(
	page: number,
	filters?: JobRoleFilters,
	ordering?: JobRoleOrdering,
): Record<string, string | number | string[]> {
	const params: Record<string, string | number | string[]> = { page };

	if (filters) {
		if (filters.roleName) params.roleName = filters.roleName;
		if (filters.location) params.location = filters.location;
		if (filters.capability.length) params.capability = filters.capability;
		if (filters.band.length) params.band = filters.band;
		if (filters.status.length) params.status = filters.status;
		if (filters.closingDate) params.closingDate = filters.closingDate;
	}

	if (ordering?.sortBy && ordering.sortOrder) {
		params.sortBy = ordering.sortBy;
		params.sortOrder = ordering.sortOrder;
	}

	return params;
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
): Promise<JobRoleDetail | undefined> {
	try {
		const { data } = await apiClient.get<JobRoleDetail>(
			`/api/job-roles/${id}`,
			{
				headers: authHeaders(token),
			},
		);
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
	filters?: JobRoleFilters,
	ordering?: JobRoleOrdering,
): Promise<PaginatedResponse | undefined> {
	try {
		const { data } = await apiClient.get<PaginatedResponse>("/api/job-roles", {
			params: toRequestParams(page, filters, ordering),
			paramsSerializer: { indexes: null }, // This ensures arrays are serialized without indices
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
	jobRoleData: CreateJobRoleInput,
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

			if (status === 400) throw new Error("Invalid job role data.");
			if (status === 401) throw new Error("Unauthorized");
			if (status === 403) throw new Error("Forbidden");
			if (status && status >= 500) {
				throw new Error(`Error creating job role: ${error.message}`);
			}

			throw new Error(`Unexpected error: ${error.message}`);
		}

		throw error;
	}
}

export async function getCreateJobRoleOptions(
	token: string,
): Promise<CreateJobRoleOptions | undefined> {
	try {
		const { data } = await apiClient.get<CreateJobRoleOptions>(
			"/api/job-roles/create-options",
			{ headers: authHeaders(token) },
		);
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(`Error fetching role options: ${error.message}`);
		}

		throw error;
	}
}

export async function updateJobRole(
	id: number,
	jobRoleData: UpdateJobRoleInput,
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

export async function getFilterOptions(
	token: string,
): Promise<FilterOptions | undefined> {
	try {
		const { data } = await apiClient.get<FilterOptions>(
			"/api/job-roles/filter-options",
			{ headers: authHeaders(token) },
		);
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { status } = error.response || {};
			if (!status) {
				throw error;
			}
			throw new Error(`Error fetching filter options: ${error.message}`);
		}
	}
}
