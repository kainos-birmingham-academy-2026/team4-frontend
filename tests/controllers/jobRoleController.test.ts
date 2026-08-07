import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import { getAllJobRoles } from "../../src/services/jobRoleApiService";
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
		});
	});
});

describe("JobRoleController - getJobRoles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the job roles page with the correct title and jobs", async () => {
		vi.mocked(getAllJobRoles).mockResolvedValue(mockJobRoles);

		await jobRoleController.getJobRoles(mockRequest, mockResponse);

		expect(getAllJobRoles).toHaveBeenCalled();
		expect(mockRender).toHaveBeenCalledWith("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: mockJobRoles,
		});
	});
});
