import axios from "axios";
import apiClient from "../config/apiClient";
import type { JobRole } from "../models/jobRole";

export async function getAllJobRoles(): Promise<JobRole[] | undefined> {
	try {
		const response = await apiClient.get<JobRole[]>("/api/job-roles");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 404) {
				console.error("Job roles not found.");
			} else {
				console.error(`Error fetching job roles: ${error.message}`);
			}
			throw error;
		}
	}
}
