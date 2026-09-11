import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import {
	ApplicationServiceError,
	assessApplication,
	getApplicationsByJobRole,
	getMyApplications,
	submitApplication,
} from "../../src/services/applicationApiService";

vi.mock("../../src/config/apiClient", () => ({
	default: { get: vi.fn(), post: vi.fn() },
}));

const token = "test-token";

describe("submitApplication", () => {
	beforeEach(() => vi.clearAllMocks());

	it("posts the role ID and application message", async () => {
		const application = {
			applicationId: 1,
			jobRoleId: 2,
			userId: 3,
			status: "In Progress",
			createdAt: "2026-09-03T00:00:00.000Z",
		};
		vi.mocked(apiClient).post = vi
			.fn()
			.mockResolvedValue({ data: application });

		await expect(
			submitApplication(2, "I am interested.", token),
		).resolves.toEqual(application);
		expect(apiClient.post).toHaveBeenCalledWith(
			"/api/applications",
			{ jobRoleId: 2, message: "I am interested." },
			{ headers: { Authorization: `Bearer ${token}` } },
		);
	});

	it("uses an API error message", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			response: { status: 400, data: { error: "Role is closed" } },
		});

		await expect(
			submitApplication(2, "I am interested.", token),
		).rejects.toEqual(expect.objectContaining({ message: "Role is closed" }));
	});

	it("returns an application service error for non-Axios failures", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(false);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue(new Error("failure"));

		await expect(
			submitApplication(2, "I am interested.", token),
		).rejects.toBeInstanceOf(ApplicationServiceError);
	});

	it("maps backend server failures to a useful service error", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			response: { status: 500, data: {} },
		});

		await expect(
			submitApplication(2, "I am interested.", token),
		).rejects.toEqual(
			expect.objectContaining({
				message: "Backend server error while submitting your application",
				statusCode: 500,
			}),
		);
	});
});

describe("getMyApplications", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns the current user's applications", async () => {
		const applications = [{ jobRoleId: 2, status: "In Progress" }];
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({
			data: { applications },
		});

		await expect(getMyApplications(token)).resolves.toEqual(applications);
		expect(apiClient.get).toHaveBeenCalledWith("/api/applications", {
			headers: { Authorization: `Bearer ${token}` },
		});
	});

	it("preserves the response status for Axios failures", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			response: { status: 401 },
		});

		await expect(getMyApplications(token)).rejects.toEqual(
			expect.objectContaining({
				message: "Unable to fetch your applications",
				statusCode: 401,
			}),
		);
	});

	it("returns a service error for non-Axios failures", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(false);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(new Error("failure"));

		await expect(getMyApplications(token)).rejects.toEqual(
			expect.objectContaining({
				message: "Unable to fetch your applications",
				statusCode: undefined,
			}),
		);
	});
});

describe("getApplicationsByJobRole", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns the applications for a role", async () => {
		const applications = [
			{
				applicationId: 10,
				userId: 5,
				applicantEmail: "applicant@example.com",
				jobRoleId: 2,
				message: "I am interested.",
				status: "In Progress",
				createdAt: "2026-09-03T00:00:00.000Z",
			},
		];
		vi.mocked(apiClient).get = vi.fn().mockResolvedValue({
			data: { applications },
		});

		await expect(getApplicationsByJobRole(2, token)).resolves.toEqual(
			applications,
		);
		expect(apiClient.get).toHaveBeenCalledWith("/api/applications/job-role/2", {
			headers: { Authorization: `Bearer ${token}` },
		});
	});

	it("preserves the status for Axios failures", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			response: { status: 403 },
		});

		await expect(getApplicationsByJobRole(2, token)).rejects.toEqual(
			expect.objectContaining({
				message: "Unable to fetch role applications",
				statusCode: 403,
			}),
		);
	});

	it("returns a service error for non-Axios failures", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(false);
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue(new Error("failure"));

		await expect(getApplicationsByJobRole(2, token)).rejects.toEqual(
			expect.objectContaining({
				message: "Unable to fetch role applications",
				statusCode: undefined,
			}),
		);
	});
});

describe("assessApplication", () => {
	beforeEach(() => vi.clearAllMocks());

	it("posts a hire action", async () => {
		const application = { applicationId: 10, status: "Hired" };
		vi.mocked(apiClient).post = vi.fn().mockResolvedValue({
			data: application,
		});

		await expect(assessApplication(10, "hire", token)).resolves.toEqual(
			application,
		);
		expect(apiClient.post).toHaveBeenCalledWith(
			"/api/applications/10/hire",
			undefined,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
	});

	it("preserves an API error when assessment fails", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			response: {
				status: 409,
				data: { error: "There are no open positions remaining for this role" },
			},
		});

		await expect(assessApplication(10, "hire", token)).rejects.toEqual(
			expect.objectContaining({
				message: "There are no open positions remaining for this role",
				statusCode: 409,
			}),
		);
	});

	it("handles an Axios assessment error without an API message", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue({
			response: { status: 500, data: {} },
		});

		await expect(assessApplication(10, "reject", token)).rejects.toEqual(
			expect.objectContaining({
				message: "Unable to assess application",
				statusCode: 500,
			}),
		);
	});

	it("handles non-Axios assessment failures", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(false);
		vi.mocked(apiClient).post = vi.fn().mockRejectedValue(new Error("failure"));

		await expect(assessApplication(10, "reject", token)).rejects.toEqual(
			expect.objectContaining({
				message: "Unable to assess application",
				statusCode: undefined,
			}),
		);
	});
});
