import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

When(
	"I filter job roles by {string}",
	async function (this: CareersWorld, roleName: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.applyRoleNameFilter(roleName);
	},
);

Then(
	"I should see roles matching {string}",
	async function (this: CareersWorld, roleName: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.firstJobRoleTitle).toContainText(roleName);
	},
);
