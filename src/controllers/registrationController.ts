import type { Request, Response } from "express";
import { AuthService, AuthServiceError } from "../services/authService";
import type {
	RegistrationFormData,
	RegistrationValidationErrors,
	RegistrationViewModel,
} from "../types/registration";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

export class RegistrationController {
	constructor(private readonly authService: AuthService = new AuthService()) {}

	showForm(_req: Request, res: Response): void {
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
			await this.authService.register({
				email: formData.email,
				password: formData.password,
			});

			res.redirect("/?registered=1");
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
