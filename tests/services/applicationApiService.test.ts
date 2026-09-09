import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import {
	ApplicationServiceError,
	submitApplication,
} from "../../src/services/applicationApiService";

vi.mock("../../src/config/apiClient", () => ({
	default: { post: vi.fn() },
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
});
