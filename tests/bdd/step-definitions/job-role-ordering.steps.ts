import { Then, When } from "@cucumber/cucumber";
import { JobRolesPage } from "../../pages/jobRolesPage.ts";
import type { CareersWorld } from "../support/world.ts";

type SortColumn =
	| "roleName"
	| "location"
	| "capability"
	| "band"
	| "closingDate"
	| "status";

function toSortColumn(column: string): SortColumn {
	const columns: Record<string, SortColumn> = {
		"role name": "roleName",
		location: "location",
		capability: "capability",
		band: "band",
		"closing date": "closingDate",
		status: "status",
	};

	const sortColumn = columns[column.toLowerCase()];
	if (!sortColumn) {
		throw new Error(`Unsupported job role sort column: ${column}`);
	}
	return sortColumn;
}

When(
	"I order job roles by {string}",
	async function (this: CareersWorld, column: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		await jobRolesPage.sortBy(toSortColumn(column));
	},
);

Then(
	"job roles should be ordered by {string} {string}",
	async function (this: CareersWorld, column: string, order: string) {
		const jobRolesPage = new JobRolesPage(this.getPage());
		const sortOrder = order === "ascending" ? "asc" : "desc";
		await jobRolesPage.expectSortApplied(toSortColumn(column), sortOrder);
	},
);

Then("job roles should have no ordering", async function (this: CareersWorld) {
	const jobRolesPage = new JobRolesPage(this.getPage());
	await jobRolesPage.expectNoSortApplied();
});
