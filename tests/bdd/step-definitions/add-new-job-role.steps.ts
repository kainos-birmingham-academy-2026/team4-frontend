import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { adminUser } from "../../fixtures/testData.ts";
import { JobRoleCreatePage } from "../../pages/jobRoleCreatePage.ts";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import { LoginPage } from "../../pages/loginPage.ts";
import type { CareersWorld } from "../support/world.ts";

Given("I am signed in as an Admin", async function (this: CareersWorld) {
	const loginPage = new LoginPage(this.getPage());
	await loginPage.open("/login");
	await loginPage.login(adminUser.email, adminUser.password);
});

When(
	"I view the available job roles as a User",
	async function (this: CareersWorld) {
		await expect(new JobRolesPage(this.getPage()).heading).toHaveText(
			"Explore Job Roles",
		);
	},
);

Then(
	"I should not see the Add new role action",
	async function (this: CareersWorld) {
		await expect(
			this.getPage().getByRole("link", { name: "Add new role" }),
		).not.toBeVisible();
	},
);

When("I open the Add new role form", async function (this: CareersWorld) {
	await this.getPage().getByRole("link", { name: "Add new role" }).click();
	await expect(new JobRoleCreatePage(this.getPage()).heading).toHaveText(
		"Add New Job Role",
	);
});

When("I complete the new job role form", async function (this: CareersWorld) {
	const createPage = new JobRoleCreatePage(this.getPage());
	await createPage.roleNameInput.fill("Platform Engineer");
	await createPage.descriptionInput.fill("Build reliable platforms.");
	await createPage.sharepointUrlInput.fill(
		"https://sharepoint.example.com/platform-engineer",
	);
	await createPage.responsibilitiesInput.fill(
		"Build platform services\nReview technical designs",
	);
	await createPage.openPositionsInput.fill("2");
	await createPage.locationInput.fill("Belfast");
	await createPage.closingDateInput.fill("2026-12-31");
	await createPage.capabilitySelect.selectOption("1");
	await createPage.bandSelect.selectOption("1");
});

When("I submit the new job role", async function (this: CareersWorld) {
	await new JobRoleCreatePage(this.getPage()).submitButton.click();
});

When(
	"I submit the new job role without completing the form",
	async function (this: CareersWorld) {
		await new JobRoleCreatePage(this.getPage()).submitButton.click();
	},
);

Then(
	"I should see that the job role was successfully created",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(/\/job-roles\?created=1/);
		await expect(this.getPage().getByRole("status")).toContainText(
			"Job role successfully created.",
		);
	},
);

Then(
	"I should remain on the Add new role form",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(/\/job-roles\/new/);
		await expect(new JobRoleCreatePage(this.getPage()).heading).toHaveText(
			"Add New Job Role",
		);
	},
);
