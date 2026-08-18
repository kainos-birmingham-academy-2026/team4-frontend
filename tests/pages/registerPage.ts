import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class RegisterPage extends BasePage {
	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly confirmPasswordInput: Locator;
	readonly submitButton: Locator;
	readonly errorSummary: Locator;
	readonly loginLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.emailInput = page.locator("#email");
		this.passwordInput = page.locator("#password");
		this.confirmPasswordInput = page.locator("#confirmPassword");
		this.submitButton = page.getByRole("button", {
			name: "Create Account",
		});
		this.errorSummary = page.locator(".form-error-summary");
		this.loginLink = page.locator('a[href="/login"]');
	}

	fieldError(field: "email" | "password" | "confirmPassword"): Locator {
		const fieldId = field === "confirmPassword" ? "confirm-password" : field;
		return this.page.locator(`#${fieldId}-error`);
	}

	async register(
		email: string,
		password: string,
		confirmPassword = password,
	): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.confirmPasswordInput.fill(confirmPassword);
		await this.submitButton.click();
	}

	async submit(): Promise<void> {
		await this.submitButton.click();
	}
}
