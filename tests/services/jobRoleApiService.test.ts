import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import {
	getAllJobRoles,
	getJobRoleById,
} from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/config/apiClient", () => ({
	default: {
		get: vi.fn(),
	},
}));

describe("jobRoleApiService - getAllJobRoles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return job roles when the API call is successful", async () => {
		vi.mocked(apiClient).get = vi
			.fn()
			.mockResolvedValue({ data: mockJobRoles });

		const result = await getAllJobRoles();

		expect(result).toEqual(mockJobRoles);
		expect(apiClient.get).toHaveBeenCalledWith("/api/job-roles");
	});

	it("should throw an error when the API returns a 404 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Not found",
			response: { status: 404 },
		});

		await expect(getAllJobRoles()).rejects.toThrow("Job roles not found.");
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(getAllJobRoles()).rejects.toThrow(
			"Error fetching job roles: Internal Server Error",
		);
	});

	it("should throw unexpected error for non-404/500 axios statuses", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(getAllJobRoles()).rejects.toThrow(
			"Unexpected error: Bad request",
		);
	});

	it("should rethrow axios errors without response status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const originalError = new Error("Network error");
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(originalError);

		await expect(getAllJobRoles()).rejects.toThrow("Network error");
	});
});

describe("jobRoleApiService - getJobRoleById", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return a job role when the API call is successful", async () => {
		const mockJobRole = mockJobRoles[0];
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({ data: mockJobRole });

		const result = await getJobRoleById(mockJobRole.id);

		expect(result).toEqual(mockJobRole);
		expect(apiClient.get).toHaveBeenCalledWith(
			`/api/job-roles/${mockJobRole.id}`,
		);
	});

	it("should return undefined when the API returns a 404 status", async () => {
		const jobRoleId = 999;
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Not found",
			response: { status: 404 },
		});

		await expect(getJobRoleById(jobRoleId)).rejects.toThrow(
			"Job role not found.",
		);
	});

	it("should return undefined when the API returns a 500 status", async () => {
		const jobRoleId = 1;
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(getJobRoleById(jobRoleId)).rejects.toThrow(
			"Error fetching job role: Internal Server Error",
		);
	});

	it("should throw unexpected error for non-404/500 axios statuses", async () => {
		const jobRoleId = 1;
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(getJobRoleById(jobRoleId)).rejects.toThrow(
			"Unexpected error: Bad request",
		);
	});

	it("should rethrow axios errors without response status", async () => {
		const jobRoleId = 1;
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const originalError = new Error("Network error");
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(originalError);

		await expect(getJobRoleById(jobRoleId)).rejects.toThrow("Network error");
	});
});
