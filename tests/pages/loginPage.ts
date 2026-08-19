import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage.ts";

export class LoginPage extends BasePage {
	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly errorSummary: Locator;
	readonly registrationLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.locator("main h1");
		this.emailInput = page.locator("#email");
		this.passwordInput = page.locator("#password");
		this.submitButton = page.locator(
			'form[action="/login"] button[type=submit]',
		);
		this.errorSummary = page.locator(".form-error-summary");
		this.registrationLink = page.locator('a[href="/register"]');
	}

	async login(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}

	async submit(): Promise<void> {
		await this.submitButton.click();
	}
}
