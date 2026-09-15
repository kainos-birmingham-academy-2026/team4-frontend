import { expect, test } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

const mockApiBaseUrl = "http://127.0.0.1:4001";

test.describe("Application assessment API", () => {
	test.beforeEach(async ({ request }) => {
		await new BaseApiClient(request, mockApiBaseUrl).resetMockState();
	});

	test("lists applications for a job role with applicant details", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getApplicationsByJobRole(1);

		expect(response.status()).toBe(200);
		expect(await response.json()).toEqual({
			applications: [
				expect.objectContaining({
					applicationId: 101,
					applicantEmail: "applicant@example.com",
					status: "In Progress",
				}),
			],
		});
	});

	test("lists the applicant's applications with role and status", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).getMyApplications();

		expect(response.status()).toBe(200);
		expect(await response.json()).toEqual({
			applications: [
				expect.objectContaining({
					applicationId: 101,
					jobRoleId: 1,
					roleName: "Software Engineer",
					status: "In Progress",
					createdAt: "2026-09-03T12:00:00.000Z",
				}),
			],
		});
	});

	test("hiring an application changes status and reduces open positions", async ({
		request,
	}) => {
		const client = new BaseApiClient(request, mockApiBaseUrl);
		const response = await client.assessApplication(101, "hire");
		const roleResponse = await client.getJobRole(1);

		expect(response.status()).toBe(200);
		expect(await response.json()).toMatchObject({
			applicationId: 101,
			status: "Hired",
		});
		expect((await roleResponse.json()).numberOfOpenPositions).toBe(2);
	});

	test("rejecting an application changes status without reducing positions", async ({
		request,
	}) => {
		const client = new BaseApiClient(request, mockApiBaseUrl);
		const response = await client.assessApplication(102, "reject");
		const roleResponse = await client.getJobRole(2);

		expect(response.status()).toBe(200);
		expect(await response.json()).toMatchObject({
			applicationId: 102,
			status: "Rejected",
		});
		expect((await roleResponse.json()).numberOfOpenPositions).toBe(2);
	});

	test("does not assess an application twice", async ({ request }) => {
		const client = new BaseApiClient(request, mockApiBaseUrl);
		await client.assessApplication(101, "hire");
		const response = await client.assessApplication(101, "reject");

		expect(response.status()).toBe(409);
		expect(await response.json()).toEqual({
			error: "Only applications in progress can be assessed",
		});
	});
});
