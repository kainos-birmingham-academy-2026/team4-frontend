import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import {
	jobRoleDetailContent,
	mockJobRole,
	testUser,
} from "../../fixtures/testData.ts";
import { JobRoleDetailPage } from "../../pages/jobRoleDetailPage.ts";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import { LoginPage } from "../../pages/loginPage.ts";
import type { CareersWorld } from "../support/world.ts";

Given("I am signed in to Kainos Careers", async function (this: CareersWorld) {
	const loginPage = new LoginPage(this.getPage());
	await loginPage.open("/login");
	await loginPage.login(testUser.email, testUser.password);
});

When("I view the available job roles", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	await expect(jobRolesPage.heading).toHaveText(
		jobRoleDetailContent.listHeading,
	);
});

When(
	"I select a job role from the available job roles",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.heading).toHaveText(
			jobRoleDetailContent.listHeading,
		);
		await expect(jobRolesPage.firstJobRole).toBeVisible();
		await jobRolesPage.openFirstJobRole();
	},
);

Then(
	"I should see the details of the selected job role",
	async function (this: CareersWorld) {
		const page = this.getPage();
		const detailPage = new JobRoleDetailPage(page);

		await expect(page).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}`);
		await expect(detailPage.heading).toHaveText(mockJobRole.roleName);
		await expect(detailPage.aboutHeading).toHaveText(
			jobRoleDetailContent.aboutHeading,
		);
		await expect(detailPage.description).toHaveText(mockJobRole.description);
		await expect(
			detailPage.metadataLabel(jobRoleDetailContent.locationLabel),
		).toBeVisible();
		await expect(detailPage.metadataValue(mockJobRole.location)).toBeVisible();
		await expect(
			detailPage.metadataLabel(jobRoleDetailContent.bandLabel),
		).toBeVisible();
		await expect(detailPage.metadataValue(mockJobRole.band)).toBeVisible();
		await expect(
			detailPage.metadataLabel(jobRoleDetailContent.capabilityLabel),
		).toBeVisible();
		await expect(
			detailPage.metadataValue(mockJobRole.capability),
		).toBeVisible();
		await expect(detailPage.responsibilities.first()).toHaveText(
			mockJobRole.responsibilities[0],
		);
		await expect(detailPage.openPositions).toContainText(
			jobRoleDetailContent.openPositions,
		);
	},
);
