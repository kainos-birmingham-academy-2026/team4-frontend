import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { mockJobRole } from "../../fixtures/testData.ts";
import { JobRoleDetailPage } from "../../pages/jobRoleDetailPage.ts";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

Given("I open the job roles list", async function (this: CareersWorld) {
	await this.getPage().goto("/job-roles");
	await expect(new JobRolesPage(this.getPage()).heading).toHaveText(
		"Explore Job Roles",
	);
});

When(
	"I choose to delete the first available job role",
	async function (this: CareersWorld) {
		const page = this.getPage();
		const jobRolesPage = new JobRolesPage(page);
		this.notedJobRoleTitle =
			(await jobRolesPage.firstJobRoleTitle.textContent()) ?? "";
		this.pendingDelete = jobRolesPage.deleteButtons.first();
	},
);

When(
	"I choose to delete the job role from the specification",
	async function (this: CareersWorld) {
		const page = this.getPage();
		const detailPage = new JobRoleDetailPage(page);
		this.notedJobRoleTitle = (await detailPage.heading.textContent()) ?? "";
		this.pendingDelete = detailPage.deleteButton;
	},
);

When("I cancel the deletion confirmation", async function (this: CareersWorld) {
	if (!this.pendingDelete) throw new Error("No delete action selected");
	this.getPage().once("dialog", (dialog) => dialog.dismiss());
	await this.pendingDelete.click();
});

When("I confirm the deletion", async function (this: CareersWorld) {
	if (!this.pendingDelete) throw new Error("No delete action selected");
	this.getPage().once("dialog", (dialog) => dialog.accept());
	await this.pendingDelete.click();
});

Then(
	"the job role should still be visible",
	async function (this: CareersWorld) {
		const title = this.notedJobRoleTitle?.trim() || mockJobRole.roleName;
		await expect(this.getPage().getByText(title)).toBeVisible();
	},
);

Then(
	"I should see that the job role was successfully deleted",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(/\/job-roles\?deleted=1/);
		await expect(this.getPage().getByRole("status")).toContainText(
			"Job role successfully deleted.",
		);
	},
);

Then(
	"the deleted job role should not be visible",
	async function (this: CareersWorld) {
		const title = this.notedJobRoleTitle?.trim() || mockJobRole.roleName;
		await expect(this.getPage().getByText(title)).not.toBeVisible();
	},
);
