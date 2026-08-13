import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app";
import * as authApiService from "../../src/services/authApiService";
import { AuthServiceError } from "../../src/services/authApiService";

const mockBody = {
	email: "test@example.com",
	password: "Password123!",
	confirmPassword: "Password123!",
};

vi.mock("../../src/middlewares/authMiddleware", () => ({
	requireAuth: vi.fn((_req, _res, next) => next()),
}));

vi.mock("../../src/services/authApiService", async (importOriginal) => {
	const actual =
		(await importOriginal()) as typeof import("../../src/services/authApiService");
	return {
		AuthServiceError: actual.AuthServiceError,
		login: vi.fn(),
		register: vi.fn(),
	};
});

describe("GET /login", () => {
	it("should render the login page if the user isn't logged in", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Login</title>");
	});
});

describe("POST /login", () => {
	it("should redirect to /job-roles on successful login", async () => {
		vi.mocked(authApiService.login).mockResolvedValue("mock-jwt-token");

		const response = await request(app).post("/login").send(mockBody);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
	});

	it("should return 401 and render the login page on failed login", async () => {
		vi.mocked(authApiService.login).mockRejectedValue(
			new Error("Invalid credentials"),
		);

		const response = await request(app).post("/login").send(mockBody);

		expect(response.status).toBe(401);
		expect(response.text).toContain("Sign In");
		expect(response.text).toContain("Invalid credentials");
	});
});

describe("GET /logout", () => {
	it("should redirect to /login", async () => {
		const response = await request(app).get("/logout");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});
});

describe("GET /register", () => {
	it("should render the registration page", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("<title>Kainos Careers - Register</title>");
	});
});

describe("POST /register", () => {
	it("should redirect to /job-roles on successful registration", async () => {
		vi.mocked(authApiService.register).mockResolvedValue("mock-jwt-token");

		const response = await request(app).post("/register").send(mockBody);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
	});

	it("should return 400 and render the registration page on failed registration", async () => {
		vi.mocked(authApiService.register).mockRejectedValue(
			new AuthServiceError("Registration failed", 400),
		);

		const response = await request(app).post("/register").send(mockBody);

		expect(response.status).toBe(400);
		expect(response.text).toContain("<title>Kainos Careers - Register</title>");
		expect(response.text).toContain("Registration failed");
	});
});
