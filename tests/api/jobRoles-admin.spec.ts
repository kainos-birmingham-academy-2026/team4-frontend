import { expect, test } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

const mockApiBaseUrl = "http://127.0.0.1:4001";

test.describe("Admin job roles API", () => {
	test.beforeEach(async ({ request }) => {
		await new BaseApiClient(request, mockApiBaseUrl).resetMockState();
	});

	test("creates a job role with valid data", async ({ request }) => {
		const payload = {
			roleName: "Platform Engineer",
			location: "Belfast",
			capabilityId: 1,
			bandId: 2,
			statusId: 1,
			closingDate: "2027-12-31T00:00:00.000Z",
			description: "Build internal platform capabilities.",
			responsibilities: ["Improve reliability", "Automate deployment"],
			sharepointUrl: "https://example.com/platform-engineer",
			numberOfOpenPositions: 2,
		};

		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).createJobRole(payload);

		expect(response.status()).toBe(201);
		expect(await response.json()).toMatchObject({
			jobRoleId: expect.any(Number),
			roleName: "Platform Engineer",
			capability: "Engineering",
			band: "Band 2",
			status: "Open",
		});
	});

	test("updates an existing job role", async ({ request }) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).updateJobRole(1, {
			roleName: "Senior Software Engineer",
			location: "London",
			capabilityId: 1,
			bandId: 2,
			statusId: 2,
			closingDate: "2027-06-30T00:00:00.000Z",
			description: "Lead technical work across squads.",
			responsibilities: ["Architect solutions", "Mentor engineers"],
			sharepointUrl: "https://example.com/senior-software-engineer",
			numberOfOpenPositions: 4,
		});

		expect(response.ok()).toBe(true);
		expect(await response.json()).toMatchObject({
			jobRoleId: 1,
			roleName: "Senior Software Engineer",
			status: "Closed",
		});
	});

	test("returns 404 when updating a job role that does not exist", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).updateJobRole(999, { roleName: "Ghost Role" });

		expect(response.status()).toBe(404);
		expect(await response.json()).toEqual({ error: "Job role not found" });
	});

	test("deletes an existing job role", async ({ request }) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).deleteJobRole(1);

		expect(response.status()).toBe(204);
	});

	test("returns 404 when deleting a job role that does not exist", async ({
		request,
	}) => {
		const response = await new BaseApiClient(
			request,
			mockApiBaseUrl,
		).deleteJobRole(999);

		expect(response.status()).toBe(404);
		expect(await response.json()).toEqual({ error: "Job role not found" });
	});
});
