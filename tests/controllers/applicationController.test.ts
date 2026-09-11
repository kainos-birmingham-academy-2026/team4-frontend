import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../src/controllers/applicationController";
import {
	ApplicationServiceError,
	assessApplication,
	getMyApplications,
	submitApplication,
} from "../../src/services/applicationApiService";
import { getJobRoleById } from "../../src/services/jobRoleApiService";
import { mockJobRoles } from "../mockJobRoles";

vi.mock("../../src/services/jobRoleApiService");
vi.mock("../../src/services/applicationApiService", async () => {
	const actual = await vi.importActual<
		typeof import("../../src/services/applicationApiService")
	>("../../src/services/applicationApiService");
	return {
		...actual,
		getMyApplications: vi.fn(),
		submitApplication: vi.fn(),
		assessApplication: vi.fn(),
	};
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

	it("renders the current user's applications", async () => {
		const applications = [
			{
				applicationId: 10,
				jobRoleId: 1,
				roleName: "Software Engineer",
				status: "In Progress",
				createdAt: "2026-09-03T00:00:00.000Z",
			},
		];
		vi.mocked(getMyApplications).mockResolvedValue(applications);

		await controller.showMyApplications(requestFor(), response);

		expect(getMyApplications).toHaveBeenCalledWith("test-token");
		expect(response.render).toHaveBeenCalledWith("pages/my-applications.njk", {
			pageTitle: "Kainos Careers - My Applications",
			applications,
		});
	});

	it("rejects an invalid role ID when showing the form", async () => {
		const request = requestFor();
		request.params.id = "invalid";

		await controller.showApplicationForm(request, response);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.render).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 400,
			message: "Invalid job role ID",
		});
	});

	it("redirects when the role is closed or has no positions", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue({
			...mockJobRoles[0],
			status: "Closed",
		});

		await controller.showApplicationForm(requestFor(), response);

		expect(response.redirect).toHaveBeenCalledWith("/job-roles/1");
	});

	it("renders not found when the role cannot be loaded", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(undefined);

		await controller.showApplicationForm(requestFor(), response);

		expect(response.status).toHaveBeenCalledWith(404);
		expect(response.render).toHaveBeenCalledWith("pages/error.njk", {
			pageTitle: "Kainos Careers - Error",
			status: 404,
			message: "Job role not found",
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

	it("rejects an invalid role ID when submitting", async () => {
		const request = requestFor({ message: "Message" });
		request.params.id = "invalid";

		await controller.submitApplication(request, response);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(submitApplication).not.toHaveBeenCalled();
	});

	it("renders not found when submitting for a missing role", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(undefined);

		await controller.submitApplication(
			requestFor({ message: "Message" }),
			response,
		);

		expect(response.status).toHaveBeenCalledWith(404);
	});

	it("submits the application message and redirects on success", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);
		vi.mocked(submitApplication).mockResolvedValue({
			applicationId: 1,
			jobRoleId: 1,
			userId: 1,
			roleName: "Software Engineer",
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

	it("shows a generic error for an unexpected submission failure", async () => {
		vi.mocked(getJobRoleById).mockResolvedValue(mockJobRoles[0]);
		vi.mocked(submitApplication).mockRejectedValue(
			new Error("network failure"),
		);

		await controller.submitApplication(
			requestFor({ message: "I am interested in this role." }),
			response,
		);

		expect(response.render).toHaveBeenCalledWith(
			"pages/job-apply.njk",
			expect.objectContaining({
				errorMessage: "Something went wrong while submitting your application",
			}),
		);
	});

	describe("assessApplication", () => {
		const assessmentRequest = (action = "hire"): Request =>
			({
				params: { id: "1", applicationId: "10", action },
				session: { jwtToken: "test-token" },
			}) as unknown as Request;

		it("redirects after a successful assessment", async () => {
			vi.mocked(assessApplication).mockResolvedValue({
				applicationId: 10,
				userId: 5,
				applicantEmail: "applicant@example.com",
				jobRoleId: 1,
				message: "Message",
				status: "Hired",
				createdAt: "2026-09-03T00:00:00.000Z",
			});

			await controller.assessApplication(assessmentRequest(), response);

			expect(assessApplication).toHaveBeenCalledWith(10, "hire", "test-token");
			expect(response.redirect).toHaveBeenCalledWith(
				"/job-roles/1?assessed=hire",
			);
		});

		it("rejects invalid assessment parameters", async () => {
			await controller.assessApplication(
				assessmentRequest("shortlist"),
				response,
			);

			expect(response.status).toHaveBeenCalledWith(400);
			expect(assessApplication).not.toHaveBeenCalled();
		});

		it("renders login for unauthorized assessment responses", async () => {
			vi.mocked(assessApplication).mockRejectedValue(
				new ApplicationServiceError("Forbidden", 403),
			);

			await controller.assessApplication(assessmentRequest(), response);

			expect(response.status).toHaveBeenCalledWith(403);
			expect(response.render).toHaveBeenCalledWith("pages/login.njk", {
				pageTitle: "Kainos Careers - Login",
				status: 403,
				message: "Forbidden",
			});
		});

		it("redirects with a service error message", async () => {
			vi.mocked(assessApplication).mockRejectedValue(
				new ApplicationServiceError("No positions remain", 409),
			);

			await controller.assessApplication(assessmentRequest(), response);

			expect(response.redirect).toHaveBeenCalledWith(
				"/job-roles/1?assessmentError=No%20positions%20remain",
			);
		});

		it("redirects with a generic assessment error", async () => {
			vi.mocked(assessApplication).mockRejectedValue(
				new Error("network failure"),
			);

			await controller.assessApplication(assessmentRequest("reject"), response);

			expect(response.redirect).toHaveBeenCalledWith(
				"/job-roles/1?assessmentError=Unable%20to%20assess%20application",
			);
		});
	});
});
