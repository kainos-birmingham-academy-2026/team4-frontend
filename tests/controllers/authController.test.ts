import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController";
import * as authApiService from "../../src/services/authApiService";
import { AuthServiceError } from "../../src/services/authApiService";
import "../../src/types/express-session.d.ts";

const mockRender = vi.fn();
const mockRedirect = vi.fn();
const mockBody = {
	email: "test@example.com",
	password: "Password123!",
	confirmPassword: "Password123!",
};

const mockRequest = {
	params: {},
	query: {},
	body: {},
	session: {
		jwtToken: undefined,
	},
} as unknown as Request;

const mockResponse = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
	render: mockRender,
	redirect: mockRedirect,
	clearCookie: vi.fn(),
} as unknown as Response;

vi.mock("../../src/services/authApiService", async (importOriginal) => {
	const actual = (await importOriginal()) as any;
	return {
		AuthServiceError: actual.AuthServiceError,
		login: vi.fn(),
		register: vi.fn(),
	};
});

const authController = new AuthController();

beforeEach(() => {
	vi.clearAllMocks();
	mockRequest.body = {};
});

describe("AuthController - showLogin", () => {
	it("should render the login page if the user isn't logged in", () => {
		authController.showLogin(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			formValues: { email: "" },
			pageTitle: "Kainos Careers - Login",
		});
	});

	it("should redirect to /job-roles if the user is logged in", () => {
		mockRequest.session.jwtToken = "mock-jwt-token";

		authController.showLogin(mockRequest, mockResponse);

		expect(mockRedirect).toHaveBeenCalledWith("/job-roles");
	});
});

describe("AuthController - login", () => {
	it("should render the login page with code 400 if the email or password is missing", async () => {
		mockRequest.body = { email: "", password: "" };

		await authController.login(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			errorMessage: "Enter both email and password",
			formValues: { email: "" },
		});
	});

	it("should redirect to /job-roles on successful login", async () => {
		mockRequest.body = mockBody;
		vi.mocked(authApiService.login).mockResolvedValue("mock-jwt-token");

		await authController.login(mockRequest, mockResponse);

		expect(mockRequest.session.jwtToken).toBe("mock-jwt-token");
		expect(mockRedirect).toHaveBeenCalledWith("/job-roles");
	});

	it("should return 401 and render the login page on failed login", async () => {
		mockRequest.body = mockBody;
		vi.mocked(authApiService.login).mockRejectedValue(
			new Error("Invalid credentials"),
		);

		await authController.login(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(401);
		expect(mockRender).toHaveBeenCalledWith("pages/login.njk", {
			errorMessage: "Invalid credentials",
			formValues: { email: mockBody.email },
		});
	});
});

describe("AuthController - logout", () => {
	it("should destroy the session and redirect to /login", () => {
		const mockDestroy = vi.fn((callback) => callback());
		mockRequest.session.destroy = mockDestroy;

		authController.logout(mockRequest, mockResponse);

		expect(mockDestroy).toHaveBeenCalled();
		expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
	});
});

describe("AuthController - showRegistrationForm", () => {
	it("should render the registration page", () => {
		authController.showRegistrationForm(mockRequest, mockResponse);

		expect(mockRender).toHaveBeenCalledWith("pages/register.njk", {
			errors: {},
			form: { email: "" },
			pageTitle: "Kainos Careers - Register",
		});
	});
});

describe("AuthController - submitRegistration", async () => {
	it("should redirect to /job-roles on successful registration", async () => {
		mockRequest.body = mockBody;
		vi.mocked(authApiService.register).mockResolvedValue("mock-jwt-token");

		await authController.submitRegistration(mockRequest, mockResponse);

		expect(mockRequest.session.jwtToken).toBe("mock-jwt-token");
		expect(mockRedirect).toHaveBeenCalledWith("/job-roles");
	});

	it("should return 400 and render the registration page on failed registration", async () => {
		mockRequest.body = mockBody;
		vi.mocked(authApiService.register).mockRejectedValue(
			new AuthServiceError("Registration failed", 400),
		);

		await authController.submitRegistration(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockRender).toHaveBeenCalledWith("pages/register.njk", {
			errors: { general: "Registration failed" },
			form: { email: mockBody.email },
			pageTitle: "Kainos Careers - Register",
		});
	});

	it("should return 400 and render the registration page if there are validation errors", async () => {
		mockRequest.body = {
			email: "invalid-email",
			password: "short",
			confirmPassword: "different",
		};

		await authController.submitRegistration(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockRender).toHaveBeenCalledWith("pages/register.njk", {
			errors: {
				email: "Enter a valid email address.",
				password:
					"Password must be more than 8 characters and include uppercase, lowercase, and special characters.",
				confirmPassword: "Passwords do not match.",
			},
			form: { email: "invalid-email" },
			pageTitle: "Kainos Careers - Register",
		});
	});

	it("should return 400 and render the registration page when a field isn't provided", async () => {
		mockRequest.body = { email: "", password: "", confirmPassword: "" };

		await authController.submitRegistration(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockRender).toHaveBeenCalledWith("pages/register.njk", {
			errors: {
				email: "Email is required.",
				password: "Password is required.",
				confirmPassword: "Confirm your password.",
			},
			form: { email: "" },
			pageTitle: "Kainos Careers - Register",
		});
	});

	it("shoyld return 400 and render the registration page when the service throws an unexpected error", async () => {
		mockRequest.body = mockBody;
		vi.mocked(authApiService.register).mockRejectedValue(
			new Error("Unexpected error"),
		);

		await authController.submitRegistration(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockRender).toHaveBeenCalledWith("pages/register.njk", {
			errors: { general: "Something went wrong while creating your account." },
			form: { email: mockBody.email },
			pageTitle: "Kainos Careers - Register",
		});
	});
});
