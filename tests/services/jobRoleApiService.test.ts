import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import {
	createJobRole,
	deleteJobRole,
	getAllJobRoles,
	getCreateJobRoleOptions,
	getFilterOptions,
	getJobRoleById,
	getPaginatedJobRoles,
	updateJobRole,
} from "../../src/services/jobRoleApiService";
import { mockJobRole1, mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/config/apiClient", () => ({
	default: {
		get: vi.fn(),
	},
}));

const mockToken = "mocked-jwt-token";

describe("jobRoleApiService - getAllJobRoles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return job roles when the API call is successful", async () => {
		vi.mocked(apiClient).get = vi
			.fn()
			.mockResolvedValue({ data: mockJobRoles });

		const result = await getAllJobRoles(mockToken);

		expect(result).toEqual(mockJobRoles);
		expect(apiClient.get).toHaveBeenCalledWith("/api/job-roles", {
			headers: { Authorization: `Bearer ${mockToken}` },
		});
	});

	it("should throw an error when the API returns a 404 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Not found",
			response: { status: 404 },
		});

		await expect(getAllJobRoles(mockToken)).rejects.toThrow(
			"Job roles not found.",
		);
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(getAllJobRoles(mockToken)).rejects.toThrow(
			"Error fetching job roles: Internal Server Error",
		);
	});

	it("should throw unexpected error for non-404/500 axios statuses", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(getAllJobRoles(mockToken)).rejects.toThrow(
			"Unexpected error: Bad request",
		);
	});

	it("should rethrow axios errors without response status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const originalError = new Error("Network error");
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(originalError);

		await expect(getAllJobRoles(mockToken)).rejects.toThrow("Network error");
	});
});

describe("jobRoleApiService - getJobRoleById", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return a job role when the API call is successful", async () => {
		const mockJobRole = mockJobRoles[0];
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({ data: mockJobRole });

		const result = await getJobRoleById(mockJobRole.id, mockToken);

		expect(result).toEqual(mockJobRole);
		expect(apiClient.get).toHaveBeenCalledWith(
			`/api/job-roles/${mockJobRole.id}`,
			{
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	it("should throw an error when the API returns a 404 status", async () => {
		const jobRoleId = 999;
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Not found",
			response: { status: 404 },
		});

		await expect(getJobRoleById(jobRoleId, mockToken)).rejects.toThrow(
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

		await expect(getJobRoleById(jobRoleId, mockToken)).rejects.toThrow(
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

		await expect(getJobRoleById(jobRoleId, mockToken)).rejects.toThrow(
			"Unexpected error: Bad request",
		);
	});

	it("should rethrow axios errors without response status", async () => {
		const jobRoleId = 1;
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const originalError = new Error("Network error");
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(originalError);

		await expect(getJobRoleById(jobRoleId, mockToken)).rejects.toThrow(
			"Network error",
		);
	});
});

describe("jobRoleApiService - getPaginatedJobRoles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return paginated job roles when the API call is successful", async () => {
		const mockPaginatedResponse = {
			jobs: mockJobRoles.slice(0, 2),
			pagination: {
				currentPage: 1,
				totalPages: 5,
				totalCount: 47,
				pageSize: 10,
				hasNext: true,
				hasPrev: false,
			},
		};
		vi.mocked(apiClient).get = vi
			.fn()
			.mockResolvedValue({ data: mockPaginatedResponse });

		const result = await getPaginatedJobRoles(1, mockToken);

		expect(result).toEqual(mockPaginatedResponse);
		expect(apiClient.get).toHaveBeenCalledWith("/api/job-roles", {
			params: { page: 1 },
			paramsSerializer: { indexes: null },
			headers: {
				Authorization: `Bearer ${mockToken}`,
			},
		});
	});

	it("should use default page 1 when no page parameter is provided", async () => {
		const mockPaginatedResponse = {
			jobs: mockJobRoles.slice(0, 2),
			pagination: {
				currentPage: 1,
				totalPages: 5,
				totalCount: 47,
				pageSize: 10,
				hasNext: true,
				hasPrev: false,
			},
		};
		vi.mocked(apiClient).get = vi
			.fn()
			.mockResolvedValue({ data: mockPaginatedResponse });

		const result = await getPaginatedJobRoles(1, mockToken);

		expect(result).toEqual(mockPaginatedResponse);
		expect(apiClient.get).toHaveBeenCalledWith("/api/job-roles", {
			params: { page: 1 },
			paramsSerializer: { indexes: null },
			headers: {
				Authorization: `Bearer ${mockToken}`,
			},
		});
	});

	it("should include all supplied filters in the request", async () => {
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({
			data: { jobs: [], pagination: {} },
		});

		await getPaginatedJobRoles(2, mockToken, {
			roleName: "Engineer",
			location: "Belfast",
			capability: ["Data"],
			band: ["Consultant"],
			status: ["Open"],
			closingDate: "2026-12-31",
		});

		expect(apiClient.get).toHaveBeenCalledWith("/api/job-roles", {
			params: {
				page: 2,
				roleName: "Engineer",
				location: "Belfast",
				capability: ["Data"],
				band: ["Consultant"],
				status: ["Open"],
				closingDate: "2026-12-31",
			},
			paramsSerializer: { indexes: null },
			headers: { Authorization: `Bearer ${mockToken}` },
		});
	});

	it("should include ordering in the request", async () => {
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({
			data: { jobs: [], pagination: {} },
		});

		await getPaginatedJobRoles(
			1,
			mockToken,
			{
				roleName: "",
				location: "",
				capability: [],
				band: [],
				status: [],
				closingDate: "",
			},
			{ sortBy: "roleName", sortOrder: "desc" },
		);

		expect(apiClient.get).toHaveBeenCalledWith("/api/job-roles", {
			params: {
				page: 1,
				sortBy: "roleName",
				sortOrder: "desc",
			},
			paramsSerializer: { indexes: null },
			headers: { Authorization: `Bearer ${mockToken}` },
		});
	});

	it("should return paginated results for page 2", async () => {
		const mockPaginatedResponse = {
			jobs: [mockJobRoles[2]],
			pagination: {
				currentPage: 2,
				totalPages: 5,
				totalCount: 47,
				pageSize: 10,
				hasNext: true,
				hasPrev: true,
			},
		};
		vi.mocked(apiClient).get = vi
			.fn()
			.mockResolvedValue({ data: mockPaginatedResponse });

		const result = await getPaginatedJobRoles(2, mockToken);

		expect(result).toEqual(mockPaginatedResponse);
		expect(apiClient.get).toHaveBeenCalledWith("/api/job-roles", {
			params: { page: 2 },
			paramsSerializer: { indexes: null },
			headers: {
				Authorization: `Bearer ${mockToken}`,
			},
		});
	});

	it("should throw an error when the API returns a 404 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Not found",
			response: { status: 404 },
		});

		await expect(getPaginatedJobRoles(1, mockToken)).rejects.toThrow(
			"Job roles not found.",
		);
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(getPaginatedJobRoles(1, mockToken)).rejects.toThrow(
			"Error fetching paginated job roles: Internal Server Error",
		);
	});

	it("should throw unexpected error for non-404/500 axios statuses", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(getPaginatedJobRoles(1, mockToken)).rejects.toThrow(
			"Unexpected error: Bad request",
		);
	});

	it("should rethrow axios errors without response status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const originalError = new Error("Network error");
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(originalError);

		await expect(getPaginatedJobRoles(1, mockToken)).rejects.toThrow(
			"Network error",
		);
	});
});

describe("jobRoleApiService - getFilterOptions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return filter options from the API", async () => {
		const options = {
			capabilities: ["Data"],
			bands: ["Consultant"],
			statuses: ["Open"],
		};
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({ data: options });

		expect(await getFilterOptions(mockToken)).toEqual(options);
	});

	it("should throw the API error when filter options have no response status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const originalError = new Error("Network error");
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(originalError);

		await expect(getFilterOptions(mockToken)).rejects.toThrow("Network error");
	});

	it("should wrap a filter options API error with a response status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Server error",
			response: { status: 500 },
		});

		await expect(getFilterOptions(mockToken)).rejects.toThrow(
			"Error fetching filter options: Server error",
		);
	});
});

describe("jobRoleApiService - createJobRole", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a job role when the API call is successful", async () => {
		vi.mocked(apiClient).post = vi
			.fn()
			.mockResolvedValue({ data: mockJobRole1 });

		const result = await createJobRole(mockJobRole1, mockToken);

		expect(result).toEqual(mockJobRole1);
		expect(apiClient.post).toHaveBeenCalledWith(
			"/api/job-roles",
			mockJobRole1,
			{ headers: { Authorization: `Bearer ${mockToken}` } },
		);
	});

	it("should throw an error when the API returns a 400 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(createJobRole(mockJobRole1, mockToken)).rejects.toThrow(
			"Invalid job role data.",
		);
	});

	it("should throw an authorisation error when the API returns a 401 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Unauthorized",
			response: { status: 401 },
		});

		await expect(createJobRole(mockJobRole1, mockToken)).rejects.toThrow(
			"Unauthorized",
		);
	});

	it("should throw a forbidden error when the API returns a 403 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Forbidden",
			response: { status: 403 },
		});

		await expect(createJobRole(mockJobRole1, mockToken)).rejects.toThrow(
			"Forbidden",
		);
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(createJobRole(mockJobRole1, mockToken)).rejects.toThrow(
			"Error creating job role: Internal Server Error",
		);
	});

	it("should throw unexpected error for non-400/401/403/500 axios statuses", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			message: "Conflict",
			response: { status: 409 },
		});

		await expect(createJobRole(mockJobRole1, mockToken)).rejects.toThrow(
			"Unexpected error: Conflict",
		);
	});
});

describe("jobRoleApiService - getCreateJobRoleOptions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return capability and band options", async () => {
		const options = {
			capabilities: [{ id: 1, name: "Engineering" }],
			bands: [{ id: 2, name: "Trainee" }],
		};
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({ data: options });

		expect(await getCreateJobRoleOptions(mockToken)).toEqual(options);
		expect(apiClient.get).toHaveBeenCalledWith(
			"/api/job-roles/create-options",
			{ headers: { Authorization: `Bearer ${mockToken}` } },
		);
	});

	it("should wrap options API errors", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			message: "Server error",
			response: { status: 500 },
		});

		await expect(getCreateJobRoleOptions(mockToken)).rejects.toThrow(
			"Error fetching role options: Server error",
		);
	});
});

describe("jobRoleApiService - updateJobRole", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should update a job role when the API call is successful", async () => {
		const updatedJobRole = { ...mockJobRole1, roleName: "Updated Role" };
		vi.mocked(apiClient).put = vi
			.fn()
			.mockResolvedValue({ data: updatedJobRole });

		const result = await updateJobRole(
			mockJobRole1.id,
			updatedJobRole,
			mockToken,
		);

		expect(result).toEqual(updatedJobRole);
		expect(apiClient.put).toHaveBeenCalledWith(
			`/api/job-roles/${mockJobRole1.id}`,
			updatedJobRole,
			{ headers: { Authorization: `Bearer ${mockToken}` } },
		);
	});

	it("should throw an error when the API returns a 400 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).put = vi.fn().mockRejectedValue({
			message: "Bad request",
			response: { status: 400 },
		});

		await expect(
			updateJobRole(mockJobRole1.id, mockJobRole1, mockToken),
		).rejects.toThrow("Invalid job role data.");
	});

	it("should throw an authorisation error when the API returns a 401 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).put = vi.fn().mockRejectedValue({
			message: "Unauthorized",
			response: { status: 401 },
		});

		await expect(
			updateJobRole(mockJobRole1.id, mockJobRole1, mockToken),
		).rejects.toThrow("Unauthorized");
	});

	it("should throw a forbidden error when the API returns a 403 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).put = vi.fn().mockRejectedValue({
			message: "Forbidden",
			response: { status: 403 },
		});
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).put = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(
			updateJobRole(mockJobRole1.id, mockJobRole1, mockToken),
		).rejects.toThrow("Error updating job role: Internal Server Error");
	});

	it("should throw unexpected error for non-400/401/403/404/500 axios statuses", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).put = vi.fn().mockRejectedValue({
			message: "Conflict",
			response: { status: 409 },
		});

		await expect(
			updateJobRole(mockJobRole1.id, mockJobRole1, mockToken),
		).rejects.toThrow("Unexpected error: Conflict");
	});
});

describe("jobRoleApiService - deleteJobRole", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should delete a job role when the API call is successful", async () => {
		vi.mocked(apiClient).delete = vi.fn().mockResolvedValue({});

		await deleteJobRole(mockJobRole1.id, mockToken);

		expect(apiClient.delete).toHaveBeenCalledWith(
			`/api/job-roles/${mockJobRole1.id}`,
			{ headers: { Authorization: `Bearer ${mockToken}` } },
		);
	});

	it("should throw an authorisation error when the API returns a 401 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).delete = vi.fn().mockRejectedValue({
			message: "Unauthorized",
			response: { status: 401 },
		});

		await expect(deleteJobRole(mockJobRole1.id, mockToken)).rejects.toThrow(
			"Unauthorized",
		);
	});

	it("should throw a forbidden error when the API returns a 403 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).delete = vi.fn().mockRejectedValue({
			message: "Forbidden",
			response: { status: 403 },
		});

		await expect(deleteJobRole(mockJobRole1.id, mockToken)).rejects.toThrow(
			"Forbidden",
		);
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).delete = vi.fn().mockRejectedValue({
			message: "Internal Server Error",
			response: { status: 500 },
		});

		await expect(deleteJobRole(mockJobRole1.id, mockToken)).rejects.toThrow(
			"Error deleting job role: Internal Server Error",
		);
	});

	it("should throw unexpected error for non-401/403/500 axios statuses", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).delete = vi.fn().mockRejectedValue({
			message: "Conflict",
			response: { status: 409 },
		});

		await expect(deleteJobRole(mockJobRole1.id, mockToken)).rejects.toThrow(
			"Unexpected error: Conflict",
		);
	});
});
