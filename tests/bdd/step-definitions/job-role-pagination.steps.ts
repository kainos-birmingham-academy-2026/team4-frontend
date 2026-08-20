import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { jobRoleListContent } from "../../fixtures/testData.ts";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

const { pageSize, totalPages } = jobRoleListContent;

const pageLinks = {
	First: (jobRolesPage: JobRolesPage) => jobRolesPage.firstPageLink,
	Previous: (jobRolesPage: JobRolesPage) => jobRolesPage.previousPageLink,
	Next: (jobRolesPage: JobRolesPage) => jobRolesPage.nextPageLink,
	Last: (jobRolesPage: JobRolesPage) => jobRolesPage.lastPageLink,
} as const;

type PageLinkName = keyof typeof pageLinks;

Given("I note the first job role shown", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	this.notedJobRoleTitle = await jobRolesPage.firstJobRoleTitle.innerText();
});

When(
	"I move forward {int} pages of job roles",
	async function (this: CareersWorld, pages: number) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		for (let click = 0; click < pages; click += 1) {
			await jobRolesPage.goToNextPage();
		}
	},
);

When("I go to the next page of job roles", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	await jobRolesPage.goToNextPage();
});

When(
	"I go to the previous page of job roles",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.goToPreviousPage();
	},
);

When(
	"I go to the first page of job roles",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.goToFirstPage();
	},
);

When("I go to the last page of job roles", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	await jobRolesPage.goToLastPage();
});

Then(
	"I should see the first, previous, next, and last page links",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.firstPageLink).toBeVisible();
		await expect(jobRolesPage.previousPageLink).toBeVisible();
		await expect(jobRolesPage.nextPageLink).toBeVisible();
		await expect(jobRolesPage.lastPageLink).toBeVisible();
	},
);

Then(
	"I should be on page {int} of the job roles",
	async function (this: CareersWorld, pageNumber: number) {
		const page = this.getPage();
		const jobRolesPage = new JobRolesPage(page);
		if (pageNumber > 1) {
			await expect(page).toHaveURL(new RegExp(`page=${pageNumber}`));
		}
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page ${pageNumber} of ${totalPages}`,
		);
	},
);

Then(
	"I should be on the last page of the job roles",
	async function (this: CareersWorld) {
		const page = this.getPage();
		const jobRolesPage = new JobRolesPage(page);
		await expect(page).toHaveURL(new RegExp(`page=${totalPages}`));
		await expect(jobRolesPage.paginationStatus).toHaveText(
			`Page ${totalPages} of ${totalPages}`,
		);
	},
);

Then(
	"I should see a full page of job roles",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.jobCards).toHaveCount(pageSize);
		await expect(jobRolesPage.jobCardTitles).toHaveCount(pageSize);
	},
);

Then(
	"I should see the job role I noted first",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.firstJobRoleTitle).toHaveText(
			String(this.notedJobRoleTitle),
		);
	},
);

Then(
	"I should not see the job role I noted first",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.firstJobRoleTitle).not.toHaveText(
			String(this.notedJobRoleTitle),
		);
	},
);

Then(
	"the {string} link should be disabled",
	async function (this: CareersWorld, linkName: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		const link = pageLinks[linkName as PageLinkName];
		if (!link) {
			throw new Error(`Unknown pagination link: ${linkName}`);
		}
		await expect(link(jobRolesPage)).toBeDisabled();
	},
);
