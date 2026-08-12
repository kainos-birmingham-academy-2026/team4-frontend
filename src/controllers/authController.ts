import type { Request, Response } from "express";
import * as authApiService from "../services/authApiService";
import { AuthServiceError } from "../services/authApiService";
import type {
	RegistrationFormData,
	RegistrationValidationErrors,
	RegistrationViewModel,
} from "../types/registrationDTO";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

export class AuthController {
	showLogin(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/job-roles");
			return;
		}

		res.render("pages/login.njk", {
			formValues: { email: "" },
		});
	}

	async login(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "").trim();

		if (!email || !password) {
			res.status(400).render("pages/login.njk", {
				errorMessage: "Enter both email and password",
				formValues: { email },
			});
			return;
		}

		try {
			const jwtToken = await authApiService.login(email, password);
			req.session.jwtToken = jwtToken;
			res.redirect("/job-roles");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to sign in";
			res.status(401).render("pages/login.njk", {
				errorMessage: message,
				formValues: { email },
			});
		}
	}

	logout(req: Request, res: Response): void {
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});
	}

	showRegistrationForm(_req: Request, res: Response): void {
		res.render("pages/register", this.toPageModel(this.getEmptyViewModel()));
	}

	async submitRegistration(req: Request, res: Response): Promise<void> {
		const formData = this.toFormData(req.body);
		const errors = this.validate(formData);

		if (Object.keys(errors).length > 0) {
			res
				.status(400)
				.render(
					"pages/register",
					this.toPageModel(this.buildViewModel(formData, errors)),
				);
			return;
		}

		try {
			const jwtToken = await authApiService.register({
				email: formData.email,
				password: formData.password,
			});

			req.session.jwtToken = jwtToken;
			res.redirect("/job-roles");
		} catch (error) {
			const message =
				error instanceof AuthServiceError
					? error.message
					: "Something went wrong while creating your account.";

			res
				.status(400)
				.render(
					"pages/register",
					this.toPageModel(this.buildViewModel(formData, { general: message })),
				);
		}
	}

	private toPageModel(
		viewModel: RegistrationViewModel,
	): RegistrationViewModel & {
		pageTitle: string;
	} {
		return {
			...viewModel,
			pageTitle: "Kainos Careers - Register",
		};
	}

	private toFormData(body: unknown): RegistrationFormData {
		const safeBody = (body ?? {}) as Record<string, unknown>;

		return {
			email: String(safeBody.email ?? "")
				.trim()
				.toLowerCase(),
			password: String(safeBody.password ?? ""),
			confirmPassword: String(safeBody.confirmPassword ?? ""),
		};
	}

	private validate(
		formData: RegistrationFormData,
	): RegistrationValidationErrors {
		const errors: RegistrationValidationErrors = {};

		if (!formData.email) {
			errors.email = "Email is required.";
		} else if (!EMAIL_REGEX.test(formData.email)) {
			errors.email = "Enter a valid email address.";
		}

		if (!formData.password) {
			errors.password = "Password is required.";
		} else if (!PASSWORD_REGEX.test(formData.password)) {
			errors.password =
				"Password must be more than 8 characters and include uppercase, lowercase, and special characters.";
		}

		if (!formData.confirmPassword) {
			errors.confirmPassword = "Confirm your password.";
		} else if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = "Passwords do not match.";
		}

		return errors;
	}

	private getEmptyViewModel(): RegistrationViewModel {
		return {
			form: {
				email: "",
			},
			errors: {},
		};
	}

	private buildViewModel(
		formData: RegistrationFormData,
		errors: RegistrationValidationErrors,
	): RegistrationViewModel {
		return {
			form: {
				email: formData.email,
			},
			errors,
		};
	}
}
