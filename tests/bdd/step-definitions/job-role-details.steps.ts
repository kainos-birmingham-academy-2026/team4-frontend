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
	await expect(
		jobRolesPage.heading,
		"Expected the job roles page heading to be shown after signing in",
	).toHaveText(jobRoleDetailContent.listHeading);
});

When(
	"I select a job role from the available job roles",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(
			jobRolesPage.heading,
			"Expected the job roles page heading before selecting a role",
		).toHaveText(jobRoleDetailContent.listHeading);
		await expect(
			jobRolesPage.firstJobRole,
			"Expected the first job role link to be visible before selecting it",
		).toBeVisible();
		await jobRolesPage.openFirstJobRole();
		await expect(
			this.getPage(),
			"Expected selecting a job role to navigate to the role details page",
		).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}`);
	},
);

Then(
	"I should see the details of the selected job role",
	async function (this: CareersWorld) {
		const page = this.getPage();
		const detailPage = new JobRoleDetailPage(page);

		await expect(
			page,
			"Expected to remain on the selected role details page",
		).toHaveURL(`/job-roles/${mockJobRole.jobRoleId}`);
		await expect(
			detailPage.heading,
			"Expected the role details heading to show the selected role name",
		).toHaveText(mockJobRole.roleName);
		await expect(
			detailPage.aboutHeading,
			"Expected the role details page to show the about section heading",
		).toHaveText(jobRoleDetailContent.aboutHeading);
		await expect(
			detailPage.description,
			"Expected the role details page to show the selected role description",
		).toHaveText(mockJobRole.description);
		await expect(
			detailPage.metadataLabel(jobRoleDetailContent.locationLabel),
			"Expected the role details page to show the location label",
		).toBeVisible();
		await expect(
			detailPage.metadataValue(mockJobRole.location),
			"Expected the role details page to show the selected role location",
		).toBeVisible();
		await expect(
			detailPage.metadataLabel(jobRoleDetailContent.bandLabel),
			"Expected the role details page to show the band label",
		).toBeVisible();
		await expect(
			detailPage.metadataValue(mockJobRole.band),
			"Expected the role details page to show the selected role band",
		).toBeVisible();
		await expect(
			detailPage.metadataLabel(jobRoleDetailContent.capabilityLabel),
			"Expected the role details page to show the capability label",
		).toBeVisible();
		await expect(
			detailPage.metadataValue(mockJobRole.capability),
			"Expected the role details page to show the selected role capability",
		).toBeVisible();
		await expect(
			detailPage.responsibilities.first(),
			"Expected the role details page to show the selected role responsibilities",
		).toHaveText(mockJobRole.responsibilities[0]);
		await expect(
			detailPage.openPositions,
			"Expected the role details page to show the number of open positions",
		).toContainText(jobRoleDetailContent.openPositions);
	},
);
