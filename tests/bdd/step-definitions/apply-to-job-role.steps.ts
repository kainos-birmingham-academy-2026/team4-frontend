import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { mockJobRoles } from "../../fixtures/testData.ts";
import type { CareersWorld } from "../support/world.ts";

When(
	"I open the application form for the {string} role",
	async function (this: CareersWorld, roleName: string) {
		const role = mockJobRoles.find((jobRole) => jobRole.roleName === roleName);
		if (!role) {
			throw new Error(`No fixture role found for ${roleName}`);
		}

		await this.getPage().goto(`/job-roles/${role.jobRoleId}/apply`);
	},
);

When(
	"I enter the application message {string}",
	async function (this: CareersWorld, message: string) {
		await this.getPage().locator("#message").fill(message);
	},
);

When("I submit the application", async function (this: CareersWorld) {
	await this.getPage()
		.getByRole("button", { name: "Submit Application" })
		.click();
});

Then(
	"I should see that my application was submitted",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(/\/job-roles\/2$/);
		await expect(this.getPage().locator(".applied-banner")).toContainText(
			"Your application has been submitted and is now in progress.",
		);
	},
);

Then(
	"I should be told that the role is no longer accepting applications",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(
			"/job-roles/3?applicationUnavailable=true",
		);
		await expect(this.getPage().getByRole("alert")).toContainText(
			"This role is no longer accepting applications.",
		);
		await expect(
			this.getPage().getByRole("link", { name: "Apply Now" }),
		).not.toBeVisible();
	},
);
