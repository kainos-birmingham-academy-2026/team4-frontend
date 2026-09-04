import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { mockJobRole } from "../../fixtures/testData.ts";
import { JobRoleEditPage } from "../../pages/jobRoleEditPage.ts";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

When(
	"I open the edit form for the first available job role",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.heading).toHaveText("Explore Job Roles");
		await jobRolesPage.jobCards
			.first()
			.getByRole("link", { name: "Edit" })
			.click();
		await expect(this.getPage()).toHaveURL(
			`/job-roles/${mockJobRole.jobRoleId}/edit`,
		);
	},
);

When(
	"I open the job specification for the first available job role",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.openFirstJobRole();
		await expect(this.getPage()).toHaveURL(
			`/job-roles/${mockJobRole.jobRoleId}`,
		);
	},
);

When(
	"I open the edit form from the job specification",
	async function (this: CareersWorld) {
		await this.getPage().getByRole("link", { name: "Edit this role" }).click();
	},
);

Then(
	"I should see the edit job role form",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(
			`/job-roles/${mockJobRole.jobRoleId}/edit`,
		);
		await expect(new JobRoleEditPage(this.getPage()).heading).toHaveText(
			"Edit Job Role",
		);
	},
);

Then(
	"the edit form should be pre-populated with the role information",
	async function (this: CareersWorld) {
		const editPage = new JobRoleEditPage(this.getPage());
		await expect(editPage.heading).toHaveText("Edit Job Role");
		await expect(editPage.roleNameInput).toHaveValue(mockJobRole.roleName);
		await expect(editPage.descriptionInput).toHaveValue(
			mockJobRole.description,
		);
		await expect(editPage.sharepointUrlInput).toHaveValue(
			mockJobRole.sharepointUrl,
		);
		await expect(editPage.responsibilitiesInput).toHaveValue(
			mockJobRole.responsibilities.join("\n"),
		);
		await expect(editPage.openPositionsInput).toHaveValue(
			String(mockJobRole.numberOfOpenPositions),
		);
		await expect(editPage.locationInput).toHaveValue(mockJobRole.location);
		await expect(editPage.closingDateInput).toHaveValue("2026-12-31");
		await expect(editPage.capabilitySelect).toHaveValue(
			String(mockJobRole.capabilityId),
		);
		await expect(editPage.bandSelect).toHaveValue(String(mockJobRole.bandId));
		await expect(editPage.statusSelect).toHaveValue(
			String(mockJobRole.statusId),
		);
	},
);

When(
	"I change the job role name to {string}",
	async function (this: CareersWorld, roleName: string) {
		await new JobRoleEditPage(this.getPage()).roleNameInput.fill(roleName);
	},
);

When(
	"I change the job role location to {string}",
	async function (this: CareersWorld, location: string) {
		await new JobRoleEditPage(this.getPage()).locationInput.fill(location);
	},
);

When(
	"I change the job role status to {string}",
	async function (this: CareersWorld, status: string) {
		const statusId = status === "Closed" ? "2" : "1";
		await new JobRoleEditPage(this.getPage()).statusSelect.selectOption(
			statusId,
		);
	},
);

When("I clear the job role status", async function (this: CareersWorld) {
	await new JobRoleEditPage(this.getPage()).statusSelect.selectOption("");
});

When("I submit the edited job role", async function (this: CareersWorld) {
	await new JobRoleEditPage(this.getPage()).submitButton.click();
});

Then(
	"I should see that the job role was successfully updated",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(/\/job-roles\?updated=1/);
		await expect(this.getPage().getByRole("status")).toContainText(
			"Job role successfully updated.",
		);
	},
);

Then(
	"the edited job role data should be sent to the API",
	async function (this: CareersWorld) {
		const response = await this.getApiRequest().get("/__test__/last-update");
		const update = await response.json();
		expect(update).toMatchObject({
			id: mockJobRole.jobRoleId,
			body: {
				roleName: "Senior Software Engineer",
				location: "Belfast",
				statusId: 2,
			},
		});
	},
);

Then(
	"I should remain on the edit job role form",
	async function (this: CareersWorld) {
		await expect(this.getPage()).toHaveURL(
			`/job-roles/${mockJobRole.jobRoleId}/edit`,
		);
		await expect(new JobRoleEditPage(this.getPage()).heading).toHaveText(
			"Edit Job Role",
		);
	},
);
