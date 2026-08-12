import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import {
	getJobRoleById,
	getPaginatedJobRoles,
} from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

const mockRender = vi.fn();

const mockRequest = {
	params: {},
	query: {},
	body: {},
} as unknown as Request;

const mockResponse = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
	render: mockRender,
} as unknown as Response;

vi.mock("../../src/services/jobRoleApiService");

const jobRoleController = new JobRoleController();

describe("JobRoleController - getHome", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the home page with the correct title", async () => {
		await jobRoleController.getHome(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/index", {
			pageTitle: "Kainos Careers - Home",
		});
	});
});

describe("JobRoleController - getRegister", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the register page with the correct title", async () => {
		await jobRoleController.getRegister(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/register", {
			pageTitle: "Kainos Careers - Register",
		});
	});
});

describe("JobRoleController - getLogin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the login page with the correct title", async () => {
		await jobRoleController.getLogin(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/login", {
			pageTitle: "Kainos Careers - Sign In",
			registrationSuccessMessage: undefined,
		});
	});

	it("should include registration success message when query has registered=1", async () => {
		mockRequest.query.registered = "1";

		await jobRoleController.getLogin(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/login", {
			pageTitle: "Kainos Careers - Sign In",
			registrationSuccessMessage:
				"Registration successful. You can now sign in.",
		});
	});
});

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

		expect(getPaginatedJobRoles).toHaveBeenCalledWith(1);
		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: mockJobRoles,
			pagination: mockPaginatedResponse.pagination,
		});
	});

	it("should render the job roles page for a specific page", async () => {
		const mockRequest2 = { ...mockRequest, query: { page: "2" } };
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

		expect(getPaginatedJobRoles).toHaveBeenCalledWith(2);
		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: [mockJobRoles[0]],
			pagination: mockPaginatedResponse.pagination,
		});
	});

	it("should handle errors and render with empty pagination", async () => {
		vi.mocked(getPaginatedJobRoles).mockRejectedValue(new Error("API error"));

		await jobRoleController.getJobRoles(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: [],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: 0,
				pageSize: 10,
				hasNext: false,
				hasPrev: false,
			},
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
