import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import {
	getAllJobRoles,
	getJobRoleById,
	getPaginatedJobRoles,
} from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

const mockRender = vi.fn();

const mockRequest = {
	params: {},
	query: {},
	body: {},
	session: {
		jwtToken: "mock-jwt-token",
	},
} as unknown as Request;

const mockResponse = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
	render: mockRender,
} as unknown as Response;

vi.mock("../../src/services/jobRoleApiService");

const jobRoleController = new JobRoleController();

describe("JobRoleController - getJobRoles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the job roles page with paginated jobs and default page 1", async () => {
		const mockPaginatedResponse = {
			jobs: mockJobRoles,
			pagination: {
				currentPage: 1,
				totalPages: 3,
				totalCount: 25,
				pageSize: 10,
				hasNext: true,
				hasPrev: false,
			},
		};
		vi.mocked(getPaginatedJobRoles).mockResolvedValue(mockPaginatedResponse);

		await jobRoleController.getJobRoles(mockRequest, mockResponse);

		expect(getPaginatedJobRoles).toHaveBeenCalledWith(1, "mock-jwt-token");
		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: mockJobRoles,
			filters: {
				q: "",
				capability: "",
			},
			capabilityOptions: ["Data", "Engineering"],
			pagination: mockPaginatedResponse.pagination,
		});
	});

	it("should render the job roles page for a specific page", async () => {
		const mockRequest2 = {
			...mockRequest,
			query: { page: "2" },
			session: { jwtToken: "mock-jwt-token" },
		} as unknown as Request;
		const mockPaginatedResponse = {
			jobs: [mockJobRoles[0]],
			pagination: {
				currentPage: 2,
				totalPages: 3,
				totalCount: 25,
				pageSize: 10,
				hasNext: true,
				hasPrev: true,
			},
		};
		vi.mocked(getPaginatedJobRoles).mockResolvedValue(mockPaginatedResponse);

		await jobRoleController.getJobRoles(mockRequest2, mockResponse);

		expect(getPaginatedJobRoles).toHaveBeenCalledWith(2, "mock-jwt-token");
		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: [mockJobRoles[0]],
			filters: {
				q: "",
				capability: "",
			},
			capabilityOptions: ["Engineering"],
			pagination: mockPaginatedResponse.pagination,
		});
	});

	it("should apply text and capability filters to paginated jobs", async () => {
		const mockRequest2 = {
			...mockRequest,
			query: { q: "data", capability: "Data" },
		} as unknown as Request;
		const mockPaginatedResponse = {
			jobs: mockJobRoles,
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: 2,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
		};
		vi.mocked(getPaginatedJobRoles).mockResolvedValue(mockPaginatedResponse);

		await jobRoleController.getJobRoles(mockRequest2, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: [mockJobRoles[1]],
			filters: {
				q: "data",
				capability: "Data",
			},
			capabilityOptions: ["Data", "Engineering"],
			pagination: mockPaginatedResponse.pagination,
		});
	});

	it("should try to render with no pagination if an error occurs", async () => {
		vi.mocked(getPaginatedJobRoles).mockRejectedValue(new Error("API error"));
		vi.mocked(getAllJobRoles).mockResolvedValue(mockJobRoles);

		await jobRoleController.getJobRoles(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: mockJobRoles,
			filters: {
				q: "",
				capability: "",
			},
			capabilityOptions: ["Data", "Engineering"],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: mockJobRoles.length,
				pageSize: mockJobRoles.length,
				hasNext: false,
				hasPrev: false,
			},
		});

		expect(getAllJobRoles).toHaveBeenCalledWith("mock-jwt-token");
	});

	it("should render the error page if both paginated and non-paginated fetches fail", async () => {
		vi.mocked(getPaginatedJobRoles).mockRejectedValue(new Error("API error"));
		vi.mocked(getAllJobRoles).mockRejectedValue(new Error("API error"));

		await jobRoleController.getJobRoles(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			message: "Error fetching job roles",
			status: 500,
		});
	});
});

describe("JobRoleController - getJobRoleDetails", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the job role detail page with the correct title and job", async () => {
		const mockJobRole = mockJobRoles[0];
		mockRequest.params.id = String(mockJobRole.id);
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);

		await jobRoleController.getJobRoleDetails(mockRequest, mockResponse);

		expect(getJobRoleById).toHaveBeenCalled();
		expect(mockRender).toHaveBeenCalledWith("pages/job-detail.njk", {
			pageTitle: `Kainos Careers - ${mockJobRole.roleName}`,
			job: mockJobRole,
		});
	});

	it("should return 400 and render error page for an invalid job role ID", async () => {
		mockRequest.params.id = "invalid-id";
		vi.mocked(getJobRoleById).mockResolvedValue(undefined);

		await jobRoleController.getJobRoleDetails(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			message: "Invalid job role ID",
			status: 400,
		});
	});

	it("should return 404 and render error page when job role is missing", async () => {
		mockRequest.params.id = "999";
		vi.mocked(getJobRoleById).mockResolvedValue(undefined);

		await jobRoleController.getJobRoleDetails(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(404);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			message: "Job role not found",
			status: 404,
		});
	});
});
