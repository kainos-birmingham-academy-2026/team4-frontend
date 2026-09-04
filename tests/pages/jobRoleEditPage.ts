import type { Locator, Page } from "@playwright/test";
import { JobRoleCreatePage } from "./jobRoleCreatePage.ts";

export class JobRoleEditPage extends JobRoleCreatePage {
	readonly statusSelect: Locator;
	readonly validationErrors: Locator;

	constructor(page: Page) {
		super(page);
		this.statusSelect = page.locator("#statusId");
		this.validationErrors = page.locator(".form-error");
	}

	async openRole(id: number): Promise<void> {
		await this.open(`/job-roles/${id}/edit`);
	}
}
