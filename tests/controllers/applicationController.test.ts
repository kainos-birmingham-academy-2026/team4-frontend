import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../src/controllers/applicationController";
import {
	ApplicationServiceError,
	submitApplication,
} from "../../src/services/applicationApiService";
import { getJobRoleById } from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/services/jobRoleApiService");
vi.mock("../../src/services/applicationApiService", async () => {
	const actual = await vi.importActual<
		typeof import("../../src/services/applicationApiService")
	>("../../src/services/applicationApiService");
	return { ...actual, submitApplication: vi.fn() };
});

const response = {
	status: vi.fn().mockReturnThis(),
	render: vi.fn(),
	redirect: vi.fn(),
} as unknown as Response;

const requestFor = (body: Record<string, unknown> = {}): Request =>
	({
		params: { id: "1" },
		body,
		session: { jwtToken: "test-token" },
	}) as unknown as Request;

const controller = new ApplicationController();

describe("ApplicationController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders an empty application message form for an eligible role", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);

		await controller.showApplicationForm(requestFor(), response);

		expect(response.render).toHaveBeenCalledWith("pages/job-apply.njk", {
			pageTitle: `Kainos Careers - Apply for ${mockJobRoles[0].roleName}`,
			job: mockJobRoles[0],
			formValues: { message: "" },
		});
	});

	it("requires an application message", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);

		await controller.submitApplication(requestFor({ message: "  " }), response);

		expect(submitApplication).not.toHaveBeenCalled();
		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.render).toHaveBeenCalledWith("pages/job-apply.njk", {
			pageTitle: `Kainos Careers - Apply for ${mockJobRoles[0].roleName}`,
			job: mockJobRoles[0],
			errorMessage: "Enter a message before submitting your application",
			formValues: { message: "" },
		});
	});

	it("submits the application message and redirects on success", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);
		vi.mocked(submitApplication).mockResolvedValue({
			applicationId: 1,
			jobRoleId: 1,
			userId: 1,
			status: "In Progress",
			createdAt: "2026-09-03T00:00:00.000Z",
		});

		await controller.submitApplication(
			requestFor({ message: "I am interested in this role." }),
			response,
		);

		expect(submitApplication).toHaveBeenCalledWith(
			1,
			"I am interested in this role.",
			"test-token",
		);
		expect(response.redirect).toHaveBeenCalledWith("/job-roles/1");
	});

	it("shows a service error and preserves the message", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);
		vi.mocked(submitApplication).mockRejectedValue(
			new ApplicationServiceError("You have already applied for this job role"),
		);

		await controller.submitApplication(
			requestFor({ message: "I am interested in this role." }),
			response,
		);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.render).toHaveBeenCalledWith("pages/job-apply.njk", {
			pageTitle: `Kainos Careers - Apply for ${mockJobRoles[0].roleName}`,
			job: mockJobRoles[0],
			errorMessage: "You have already applied for this job role",
			formValues: { message: "I am interested in this role." },
		});
	});
});
