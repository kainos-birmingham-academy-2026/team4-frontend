import type { Request, Response } from "express";
import type { SessionData } from "express-session";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import {
	createJobRole,
	deleteJobRole,
	getAllJobRoles,
	getJobRoleById,
	getPaginatedJobRoles,
	updateJobRole,
} from "../../src/services/jobRoleApiService";
import { mockJobRole1, mockJobRoles } from "../mockJobRoles";

const mockRender = vi.fn();

const mockRequest = {
	params: {},
	query: {},
	body: {},
	session: {
		jwtToken: "mock-jwt-token",
	} as unknown as SessionData,
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
		mockRequest.session.jwtToken = "mock-jwt-token"; // Reset JWT token for each test
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

describe("JobRoleController - create", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call createJobRole and handle success", async () => {
		const mockJobRoleData = {
			roleName: "New Role",
			description: "Description",
		};
		mockRequest.body = mockJobRoleData;
		vi.mocked(createJobRole).mockResolvedValue(mockJobRole1);

		await jobRoleController.create(mockRequest, mockResponse);

		expect(createJobRole).toHaveBeenCalledWith(
			mockJobRoleData,
			"mock-jwt-token",
		);
	});

	it("should redirect to the login page if the user is not authorized", async () => {
		vi.mocked(createJobRole).mockRejectedValue(new Error("Forbidden"));

		await jobRoleController.create(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(403);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			message: "Forbidden access",
			status: 403,
		});
	});

	it("should redirect to the login page if the user is not authenticated", async () => {
		vi.mocked(createJobRole).mockRejectedValue(new Error("Unauthorized"));

		await jobRoleController.create(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(401);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			message: "Unauthorized access",
			status: 401,
		});
	});

	it("should render the error page if an unexpected error occurs", async () => {
		vi.mocked(createJobRole).mockRejectedValue(new Error("Unexpected error"));

		await jobRoleController.create(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 500,
			message: "Unexpected error",
		});
	});

	it("should create its own error message if none are provided", async () => {
		vi.mocked(createJobRole).mockRejectedValue({});

		await jobRoleController.create(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 500,
			message: "Unable to create job role",
		});
	});
});

describe("JobRoleController - update", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call updateJobRole and handle success", async () => {
		const mockJobRoleData = { roleName: "Updated Role" };
		mockRequest.params.id = "1";
		mockRequest.body = mockJobRoleData;
		vi.mocked(updateJobRole).mockResolvedValue(mockJobRole1);

		await jobRoleController.update(mockRequest, mockResponse);

		expect(updateJobRole).toHaveBeenCalledWith(
			1,
			mockJobRoleData,
			"mock-jwt-token",
		);
	});

	it("should redirect to the login page if the user is not authorized", async () => {
		mockRequest.params.id = "1";
		vi.mocked(updateJobRole).mockRejectedValue(new Error("Forbidden"));

		await jobRoleController.update(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(403);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			message: "Forbidden access",
			status: 403,
		});
	});

	it("should redirect to the login page if the user is not authenticated", async () => {
		mockRequest.params.id = "1";
		vi.mocked(updateJobRole).mockRejectedValue(new Error("Unauthorized"));

		await jobRoleController.update(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(401);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			message: "Unauthorized access",
			status: 401,
		});
	});

	it("should render the error page if an unexpected error occurs", async () => {
		mockRequest.params.id = "1";
		vi.mocked(updateJobRole).mockRejectedValue(new Error("Unexpected error"));

		await jobRoleController.update(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 500,
			message: "Unexpected error",
		});
	});

	it("should create its own error message if none are provided", async () => {
		mockRequest.params.id = "1";
		vi.mocked(updateJobRole).mockRejectedValue({});

		await jobRoleController.update(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 500,
			message: "Unable to update job role",
		});
	});
});

describe("JobRoleController - delete", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call deleteJobRole and handle success", async () => {
		mockRequest.params.id = "1";
		vi.mocked(deleteJobRole).mockResolvedValue();

		await jobRoleController.delete(mockRequest, mockResponse);

		expect(deleteJobRole).toHaveBeenCalledWith(1, "mock-jwt-token");
	});

	it("should redirect to the login page if the user is not authorized", async () => {
		mockRequest.params.id = "1";
		vi.mocked(deleteJobRole).mockRejectedValue(new Error("Forbidden"));

		await jobRoleController.delete(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(403);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			message: "Forbidden access",
			status: 403,
		});
	});

	it("should redirect to the login page if the user is not authenticated", async () => {
		mockRequest.params.id = "1";
		vi.mocked(deleteJobRole).mockRejectedValue(new Error("Unauthorized"));

		await jobRoleController.delete(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(401);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			message: "Unauthorized access",
			status: 401,
		});
	});

	it("should render the error page if an unexpected error occurs", async () => {
		mockRequest.params.id = "1";
		vi.mocked(deleteJobRole).mockRejectedValue(new Error("Unexpected error"));

		await jobRoleController.delete(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 500,
			message: "Unexpected error",
		});
	});

	it("should create its own error message if none are provided", async () => {
		mockRequest.params.id = "1";
		vi.mocked(deleteJobRole).mockRejectedValue({});

		await jobRoleController.delete(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockRender).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 500,
			message: "Unable to delete job role",
		});
	});
});
