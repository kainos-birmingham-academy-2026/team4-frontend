import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import { getAllJobRoles } from "../../src/services/jobRoleApiService";
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
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			response: { status: 404 },
		});

		const result = await getAllJobRoles();
		expect(result).toBeUndefined();
	});

	it("should throw an error when the API returns a 500 status", async () => {
		vi.mocked(apiClient).get = vi.fn().mockRejectedValue({
			response: { status: 500, message: "Internal Server Error" },
		});

		const result = await getAllJobRoles();
		expect(result).toBeUndefined();
	});
});
