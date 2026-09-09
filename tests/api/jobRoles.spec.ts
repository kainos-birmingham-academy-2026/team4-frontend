import { expect, test } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

const mockApiBaseUrl = "http://127.0.0.1:4001";
const frontendBaseUrl = "http://127.0.0.1:3001";

test.describe("Job roles API", () => {
	test("returns paginated job roles", async ({ request }) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getJobRoles();

		expect(response.ok()).toBe(true);
		const body = await response.json();
		expect(body.jobs).toHaveLength(10);
		expect(body.jobs).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					jobRoleId: 1,
					roleName: "Software Engineer",
					capability: "Engineering",
				}),
				expect.objectContaining({
					jobRoleId: 2,
					roleName: "Data Analyst",
					capability: "Data",
				}),
			]),
		);
		expect(body).toMatchObject({
			pagination: {
				currentPage: 1,
				totalPages: 6,
				totalCount: 60,
				pageSize: 10,
				hasNext: true,
				hasPrev: false,
			},
		});
	});

	test("returns the second page when page=2 is requested", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getJobRoles({ page: "2" });

		expect(response.ok()).toBe(true);
		const body = await response.json();
		expect(body.pagination).toMatchObject({
			currentPage: 2,
			totalPages: 6,
			pageSize: 10,
			hasNext: true,
			hasPrev: true,
		});
		expect(body.jobs).toHaveLength(10);
		expect(body.jobs[0].jobRoleId).toBeGreaterThan(10);
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

	test("filters and sorts job roles using query parameters", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getJobRoles({
			capability: "Engineering",
			roleName: "Engineer",
			sortBy: "roleName",
			sortOrder: "desc",
		});

		expect(response.ok()).toBe(true);
		const body = await response.json();
		expect(body.jobs).toEqual([
			expect.objectContaining({
				jobRoleId: 1,
				roleName: "Software Engineer",
				capability: "Engineering",
			}),
		]);
		expect(body.pagination).toMatchObject({
			currentPage: 1,
			totalPages: 1,
			totalCount: 1,
		});
	});

	test("redirects unauthenticated users away from protected job roles page", async ({
		request,
	}) => {
		const response = await request.get(`${frontendBaseUrl}/job-roles`, {
			maxRedirects: 0,
		});

		expect(response.status()).toBe(302);
		expect(response.headers().location).toBe("/login");
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
