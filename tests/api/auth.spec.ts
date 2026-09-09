import { expect, test } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

const mockApiBaseUrl = "http://127.0.0.1:4001";
const frontendBaseUrl = "http://127.0.0.1:3001";

test.describe("Authentication API", () => {
	test.beforeEach(async ({ request }) => {
		await new BaseApiClient(request, mockApiBaseUrl).resetMockState();
	});

	test("logs in with valid credentials and returns a JWT token", async ({
		request,
	}) => {
		const response = await new BaseApiClient(request, mockApiBaseUrl).login(
			"tester@example.com",
			"Password123!",
		);

		expect(response.ok()).toBe(true);
		expect(await response.json()).toMatchObject({
			token: expect.any(String),
		});
	});

	test("returns 400 when the login form is missing required values", async ({
		request,
	}) => {
		const response = await request.post(`${frontendBaseUrl}/login`, {
			data: { email: "", password: "" },
		});

		expect(response.status()).toBe(400);
		expect(await response.text()).toContain("Enter both email and password");
	});

	test("returns 401 for invalid login credentials", async ({ request }) => {
		const response = await new BaseApiClient(request, mockApiBaseUrl).login(
			"tester@example.com",
			"wrong-password",
		);

		expect(response.status()).toBe(401);
		expect(await response.json()).toEqual({
			error: "Invalid email or password",
		});
	});

	test("registers a new user and returns a token", async ({ request }) => {
		const response = await new BaseApiClient(request, mockApiBaseUrl).register(
			"new-user@example.com",
			"Password123!",
			"Password123!",
		);

		expect(response.ok()).toBe(true);
		expect(await response.json()).toMatchObject({
			token: expect.any(String),
		});
	});

	test("returns 400 when registering an existing email", async ({
		request,
	}) => {
		const response = await new BaseApiClient(request, mockApiBaseUrl).register(
			"existing@example.com",
			"Password123!",
			"Password123!",
		);

		expect(response.status()).toBe(400);
		expect(await response.json()).toEqual({
			error: "An account already exists for this email.",
		});
	});
});
