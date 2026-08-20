import { expect, test } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

const mockApiBaseUrl = "http://127.0.0.1:4001";

test.describe("Job roles API", () => {
	test("returns paginated job roles", async ({ request }) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getJobRoles();

		expect(response.ok()).toBe(true);
		expect(await response.json()).toMatchObject({
			jobs: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					capability: "Engineering",
				},
				{
					jobRoleId: 2,
					roleName: "Data Analyst",
					capability: "Data",
				},
			],
			pagination: {
				currentPage: 1,
				totalPages: 2,
				totalCount: 3,
				pageSize: 2,
				hasNext: true,
				hasPrev: false,
			},
		});
	});

	test("filters job roles by capability and returns the matching page", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getJobRoles({ capability: "Engineering" });

		expect(response.ok()).toBe(true);
		expect(await response.json()).toMatchObject({
			jobs: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
				},
			],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalCount: 1,
				hasNext: false,
				hasPrev: false,
			},
		});
	});

	test("returns not found for an unknown job role", async ({ request }) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getJobRole(999);

		expect(response.status()).toBe(404);
		expect(await response.json()).toEqual({ error: "Job role not found" });
	});
});
