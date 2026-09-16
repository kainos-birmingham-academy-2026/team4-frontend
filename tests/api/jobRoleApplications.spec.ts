import { expect, test } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

const mockApiBaseUrl = "http://127.0.0.1:4001";

test.describe("Job role application eligibility API", () => {
	test.beforeEach(async ({ request }) => {
		await new BaseApiClient(request, mockApiBaseUrl).resetMockState();
	});

	test("returns closed roles with no available positions", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getJobRole(3);

		expect(response.status()).toBe(200);
		expect(await response.json()).toEqual(
			expect.objectContaining({
				status: "Closed",
				numberOfOpenPositions: 0,
			}),
		);
	});

	test("rejects an application for a closed role", async ({ request }) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).submitApplication(3, "I am interested in this role.");

		expect(response.status()).toBe(400);
		expect(await response.json()).toEqual({
			error: "This job role is not currently open for applications",
		});
	});

	test("accepts an application for an open role with available positions", async ({
		request,
	}) => {
		const client = new BaseApiClient(request, mockApiBaseUrl);
		const response = await client.submitApplication(
			2,
			"I am interested in this role.",
		);

		expect(response.status()).toBe(201);
		expect(await response.json()).toEqual(
			expect.objectContaining({
				jobRoleId: 2,
				roleName: "Data Analyst",
				message: "I am interested in this role.",
				status: "In Progress",
			}),
		);
	});
});
