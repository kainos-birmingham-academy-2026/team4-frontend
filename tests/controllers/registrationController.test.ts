import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegistrationController } from "../../src/controllers/registrationController";
import {
	type AuthService,
	AuthServiceError,
} from "../../src/services/authService";

type MockResponse = Pick<Response, "status" | "render" | "redirect">;

describe("RegistrationController", () => {
	const authServiceMock: Pick<AuthService, "register"> = {
		register: vi.fn(),
	};

	const makeResponse = (): MockResponse =>
		({
			status: vi.fn().mockReturnThis(),
			render: vi.fn(),
			redirect: vi.fn(),
		}) as unknown as MockResponse;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the registration form", () => {
		const controller = new RegistrationController(
			authServiceMock as unknown as AuthService,
		);
		const req = {} as Request;
		const res = makeResponse();

		controller.showForm(req, res as unknown as Response);

		expect(res.render).toHaveBeenCalledWith("pages/register", {
			pageTitle: "Kainos Careers - Register",
			form: { email: "" },
			errors: {},
		});
	});

	it("returns validation errors for invalid submission", async () => {
		const controller = new RegistrationController(
			authServiceMock as unknown as AuthService,
		);
		const req = {
			body: {
				email: "bad-email",
				password: "weak",
				confirmPassword: "mismatch",
			},
		} as Request;
		const res = makeResponse();

		await controller.submitRegistration(req, res as unknown as Response);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			"pages/register",
			expect.objectContaining({
				pageTitle: "Kainos Careers - Register",
				form: { email: "bad-email" },
				errors: {
					email: "Enter a valid email address.",
					password:
						"Password must be more than 8 characters and include uppercase, lowercase, and special characters.",
					confirmPassword: "Passwords do not match.",
				},
			}),
		);
	});

	it("submits and redirects when registration is successful", async () => {
		vi.mocked(authServiceMock.register).mockResolvedValue(undefined);
		const controller = new RegistrationController(
			authServiceMock as unknown as AuthService,
		);
		const req = {
			body: {
				email: "  TEST@EXAMPLE.COM ",
				password: "ValidPass!1",
				confirmPassword: "ValidPass!1",
			},
		} as Request;
		const res = makeResponse();

		await controller.submitRegistration(req, res as unknown as Response);

		expect(authServiceMock.register).toHaveBeenCalledWith({
			email: "test@example.com",
			password: "ValidPass!1",
		});
		expect(res.redirect).toHaveBeenCalledWith("/login?registered=1");
	});

	it("renders service error message when auth service rejects with AuthServiceError", async () => {
		vi.mocked(authServiceMock.register).mockRejectedValue(
			new AuthServiceError("User already exists", 400),
		);
		const controller = new RegistrationController(
			authServiceMock as unknown as AuthService,
		);
		const req = {
			body: {
				email: "test@example.com",
				password: "ValidPass!1",
				confirmPassword: "ValidPass!1",
			},
		} as Request;
		const res = makeResponse();

		await controller.submitRegistration(req, res as unknown as Response);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			"pages/register",
			expect.objectContaining({
				errors: { general: "User already exists" },
			}),
		);
	});

	it("renders generic error message for unexpected failures", async () => {
		vi.mocked(authServiceMock.register).mockRejectedValue(new Error("boom"));
		const controller = new RegistrationController(
			authServiceMock as unknown as AuthService,
		);
		const req = {
			body: {
				email: "test@example.com",
				password: "ValidPass!1",
				confirmPassword: "ValidPass!1",
			},
		} as Request;
		const res = makeResponse();

		await controller.submitRegistration(req, res as unknown as Response);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			"pages/register",
			expect.objectContaining({
				errors: {
					general: "Something went wrong while creating your account.",
				},
			}),
		);
	});
});
