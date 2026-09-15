import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

Given(
	"I am on the job roles page as an Admin",
	async function (this: CareersWorld) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await expect(jobRolesPage.heading).toHaveText("Explore Job Roles");
	},
);

When("I generate the job roles report", async function (this: CareersWorld) {
	const page = this.getPage();
	const jobRolesPage = new JobRolesPage(page);
	const downloadPromise = page.waitForEvent("download");
	await jobRolesPage.exportReportLink.click();
	const download = await downloadPromise;
	const stream = await download.createReadStream();
	if (!stream) {
		throw new Error("CSV download stream was not available");
	}

	let content = "";
	for await (const chunk of stream) {
		content += chunk.toString();
	}
	this.downloadFilename = download.suggestedFilename();
	this.downloadContent = content;
});

Then(
	"the job roles report should be downloaded as {string}",
	async function (this: CareersWorld, filename: string) {
		expect(this.downloadFilename).toBe(filename);
	},
);

Then(
	"the job roles report should contain {string}",
	async function (this: CareersWorld, value: string) {
		expect(this.downloadContent).toContain(value);
	},
);

Then(
	"the job roles report header should not contain {string}",
	async function (this: CareersWorld, value: string) {
		const header = this.downloadContent?.split("\r\n")[0] ?? "";
		expect(header).not.toContain(value);
	},
);
