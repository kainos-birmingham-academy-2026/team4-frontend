import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class LoginPage extends BasePage {
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;

	constructor(page: Page) {
		super(page);
		this.emailInput = page.locator("#email");
		this.passwordInput = page.locator("#password");
		this.submitButton = page.locator(
			'form[action="/login"] button[type=submit]',
		);
	}

	async login(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}
}
