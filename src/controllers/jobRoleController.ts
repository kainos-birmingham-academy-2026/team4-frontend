import type { Request, Response } from "express";
import { getMyApplications } from "../services/applicationApiService";
import {
	createJobRole,
	deleteJobRole,
	getAllJobRoles,
	getCreateJobRoleOptions,
	getFilterOptions,
	getJobRoleById,
	getPaginatedJobRoles,
	updateJobRole,
} from "../services/jobRoleApiService";
import type { ApplicationSummary } from "../types/applicationDTO";
import type {
	FilterOptions,
	JobRole,
	JobRoleFilters,
	JobRoleOrdering,
	JobRoleSortBy,
	JobRoleSortOrder,
} from "../types/jobRoleDTO";

const EMPTY_FILTER_OPTIONS: FilterOptions = {
	capabilities: [],
	bands: [],
	statuses: [],
};

function toText(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.filter((item) => typeof item === "string");
	}
	return typeof value === "string" && value.length > 0 ? [value] : [];
}

function extractOrdering(query: Request["query"]): JobRoleOrdering {
	const validSortColumns: JobRoleSortBy[] = [
		"jobRoleId",
		"roleName",
		"location",
		"capability",
		"band",
		"closingDate",
		"status",
	];
	const sortBy = query.sortBy as JobRoleSortBy;
	const sortOrder = query.sortOrder as JobRoleSortOrder;

	return {
		sortBy: validSortColumns.includes(sortBy) ? sortBy : undefined,
		sortOrder:
			sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
	};
}

function getNextSortOrder(
	currentSortBy: JobRoleSortBy | undefined,
	currentSortOrder: JobRoleSortOrder | undefined,
	column: JobRoleSortBy,
): JobRoleSortOrder | undefined {
	if (currentSortBy !== column) return "asc";
	return currentSortOrder === "asc" ? "desc" : undefined;
}

export function extractFilters(query: Request["query"]): JobRoleFilters {
	return {
		roleName: toText(query.roleName),
		location: toText(query.location),
		capability: toStringArray(query.capability),
		band: toStringArray(query.band),
		status: toStringArray(query.status),
		closingDate: toText(query.closingDate),
	};
}

export function buildFilterQuery(
	filters: JobRoleFilters,
	ordering: JobRoleOrdering,
): string {
	const params = new URLSearchParams();

	if (filters.roleName) params.append("roleName", filters.roleName);
	if (filters.location) params.append("location", filters.location);
	for (const value of filters.capability) params.append("capability", value);
	for (const value of filters.band) params.append("band", value);
	for (const value of filters.status) params.append("status", value);
	if (filters.closingDate) params.append("closingDate", filters.closingDate);
	if (ordering.sortBy && ordering.sortOrder) {
		params.append("sortBy", ordering.sortBy);
		params.append("sortOrder", ordering.sortOrder);
	}

	const query = params.toString();
	return query ? `&${query}` : "";
}

function getCreateFormValues(
	body: Record<string, unknown>,
	includeStatus = false,
) {
	return {
		roleName: String(body.roleName ?? ""),
		description: String(body.description ?? ""),
		sharepointUrl: String(body.sharepointUrl ?? ""),
		responsibilities: String(body.responsibilities ?? ""),
		numberOfOpenPositions: String(body.numberOfOpenPositions ?? ""),
		location: String(body.location ?? ""),
		closingDate: String(body.closingDate ?? ""),
		capabilityId: String(body.capabilityId ?? ""),
		bandId: String(body.bandId ?? ""),
		...(includeStatus ? { statusId: String(body.statusId ?? "") } : {}),
	};
}

function validateCreateForm(
	values: ReturnType<typeof getCreateFormValues>,
	isEdit = false,
): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!values.roleName.trim()) {
		errors.roleName = "Enter a job role name.";
	}

	if (!values.description.trim()) {
		errors.description = "Enter a job specification summary.";
	}

	if (!values.sharepointUrl.trim()) {
		errors.sharepointUrl = "Enter a SharePoint link.";
	} else if (!/^https?:\/\/\S+$/i.test(values.sharepointUrl)) {
		errors.sharepointUrl = "Enter a valid SharePoint link.";
	}

	if (!values.responsibilities.trim()) {
		errors.responsibilities = "Enter at least one responsibility.";
	}

	if (!values.location.trim()) {
		errors.location = "Enter a location.";
	}

	const openPositions = Number(values.numberOfOpenPositions);
	if (!Number.isInteger(openPositions) || openPositions < 0) {
		errors.numberOfOpenPositions = "Enter a whole number of open positions.";
	}

	if (!values.closingDate) {
		errors.closingDate = "Select a closing date.";
	}

	if (!values.capabilityId) {
		errors.capabilityId = "Select a capability.";
	}

	if (!values.bandId) {
		errors.bandId = "Select a band.";
	}

	if (isEdit && !values.statusId) {
		errors.statusId = "Select a status.";
	}

	return errors;
}

export class JobRoleController {
	private getJwtToken(req: Request): string {
		return req.session.jwtToken ?? "";
	}

	private async getUserApplications(
		token: string,
	): Promise<ApplicationSummary[]> {
		try {
			return await getMyApplications(token);
		} catch {
			return [];
		}
	}

	private withDisplayStatus<T extends JobRole>(
		jobs: T[],
		applications: ApplicationSummary[],
	): (T & { displayStatus: string })[] {
		const statusByJobRoleId = new Map(
			applications.map((application) => [
				application.jobRoleId,
				application.status,
			]),
		);
		return jobs.map((job) => ({
			...job,
			displayStatus: statusByJobRoleId.get(job.jobRoleId) ?? job.status,
		}));
	}

	private handleForbiddenError(res: Response): void {
		res.status(403).render("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			status: 403,
			message: "Forbidden access",
		});
	}

	private handleUnauthorizedError(res: Response): void {
		res.status(401).render("pages/login.njk", {
			pageTitle: "Kainos Careers - Login",
			status: 401,
			message: "Unauthorized access",
		});
	}

	async getJobRoles(req: Request, res: Response): Promise<void> {
		const page = parseInt(req.query.page as string, 10) || 1;
		const successMessage =
			req.query.created === "1"
				? "Job role successfully created."
				: req.query.updated === "1"
					? "Job role successfully updated."
					: undefined;
		const token = this.getJwtToken(req);
		const filters = extractFilters(req.query);
		const ordering = extractOrdering(req.query);
		const filterQuery = buildFilterQuery(filters, ordering);
		const sortLinks = {
			roleName: getNextSortOrder(
				ordering.sortBy,
				ordering.sortOrder,
				"roleName",
			),
			location: getNextSortOrder(
				ordering.sortBy,
				ordering.sortOrder,
				"location",
			),
			capability: getNextSortOrder(
				ordering.sortBy,
				ordering.sortOrder,
				"capability",
			),
			band: getNextSortOrder(ordering.sortBy, ordering.sortOrder, "band"),
			closingDate: getNextSortOrder(
				ordering.sortBy,
				ordering.sortOrder,
				"closingDate",
			),
			status: getNextSortOrder(ordering.sortBy, ordering.sortOrder, "status"),
		};
		const sortQuery = (column: JobRoleSortBy): string => {
			const nextSortOrder = getNextSortOrder(
				ordering.sortBy,
				ordering.sortOrder,
				column,
			);
			return buildFilterQuery(filters, {
				sortBy: nextSortOrder ? column : undefined,
				sortOrder: nextSortOrder,
			});
		};

		let filterOptions = EMPTY_FILTER_OPTIONS;
		try {
			filterOptions = (await getFilterOptions(token)) ?? EMPTY_FILTER_OPTIONS;
		} catch {
			// Filtering remains usable when options cannot be loaded.
		}

		try {
			const [data, applications] = await Promise.all([
				getPaginatedJobRoles(page, token, filters, ordering),
				this.getUserApplications(token),
			]);
			res.render("pages/job-roles", {
				pageTitle: "Kainos Careers - Job Roles",
				...(successMessage ? { successMessage } : {}),
				jobs: this.withDisplayStatus(data?.jobs ?? [], applications),
				pagination: data?.pagination ?? {
					currentPage: 1,
					totalPages: 1,
					totalCount: 0,
					pageSize: 10,
					hasNext: false,
					hasPrev: false,
				},
				filters,
				filterOptions,
				filterQuery,
				hasActiveFilters: filterQuery.length > 0,
				ordering,
				sortLinks,
				sortQuery,
			});
		} catch {
			await this.getNonPaginatedJobRoles(req, res);
		}
	}

	async getNonPaginatedJobRoles(req: Request, res: Response): Promise<void> {
		const token = this.getJwtToken(req);
		try {
			const [jobs, applications] = await Promise.all([
				getAllJobRoles(token),
				this.getUserApplications(token),
			]);
			const safeJobs = jobs ?? [];
			const ordering = extractOrdering({});
			res.render("pages/job-roles", {
				pageTitle: "Kainos Careers - Job Roles",
				jobs: this.withDisplayStatus(safeJobs, applications),
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalCount: safeJobs.length,
					pageSize: safeJobs.length,
					hasNext: false,
					hasPrev: false,
				},
				filters: extractFilters({}),
				filterOptions: EMPTY_FILTER_OPTIONS,
				filterQuery: "",
				hasActiveFilters: false,
				ordering,
				sortLinks: {},
				sortQuery: () => "",
			});
		} catch {
			res.render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 500,
				message: "Error fetching job roles",
			});
		}
	}

	async getJobRoleDetails(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			res.status(400).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 400,
				message: "Invalid job role ID",
			});
			return;
		}

		const token = this.getJwtToken(req);
		let jobRole: JobRole | undefined;
		try {
			jobRole = await getJobRoleById(id, token);
		} catch (error) {
			if (error instanceof Error && error.message === "Job role not found.") {
				res.status(404).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 404,
					message: "Job role not found",
				});
				return;
			}
			throw error;
		}
		if (!jobRole) {
			res.status(404).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 404,
				message: "Job role not found",
			});
			return;
		}

		const applications = await this.getUserApplications(token);
		const application = applications.find(
			(userApplication) => userApplication.jobRoleId === jobRole.jobRoleId,
		);
		res.render("pages/job-detail.njk", {
			pageTitle: `Kainos Careers - ${jobRole.roleName}`,
			job: jobRole,
			displayStatus: application?.status ?? jobRole.status,
			applied: Boolean(application),
		});
	}

	async create(req: Request, res: Response): Promise<void> {
		const formValues = getCreateFormValues(req.body);
		const errors = validateCreateForm(formValues);

		if (Object.keys(errors).length > 0) {
			const options = await getCreateJobRoleOptions(this.getJwtToken(req));

			res.status(400).render("pages/job-role-create.njk", {
				pageTitle: "Kainos Careers - Add Job Role",
				options,
				formValues,
				errors,
			});
			return;
		}

		try {
			await createJobRole(
				{
					roleName: formValues.roleName.trim(),
					description: formValues.description.trim(),
					sharepointUrl: formValues.sharepointUrl.trim(),
					responsibilities: formValues.responsibilities
						.split("\n")
						.map((responsibility) => responsibility.trim())
						.filter(Boolean),
					numberOfOpenPositions: Number(formValues.numberOfOpenPositions),
					location: formValues.location.trim(),
					closingDate: formValues.closingDate,
					capabilityId: Number(formValues.capabilityId),
					bandId: Number(formValues.bandId),
				},
				this.getJwtToken(req),
			);

			res.redirect("/job-roles?created=1");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to create job role";

			if (message === "Forbidden") {
				this.handleForbiddenError(res);
				return;
			}

			if (message === "Unauthorized") {
				this.handleUnauthorizedError(res);
				return;
			}

			const options = await getCreateJobRoleOptions(this.getJwtToken(req));

			res.status(400).render("pages/job-role-create.njk", {
				pageTitle: "Kainos Careers - Add Job Role",
				options,
				formValues,
				errors: { general: message },
			});
		}
	}

	async showCreateForm(req: Request, res: Response): Promise<void> {
		try {
			const options = await getCreateJobRoleOptions(this.getJwtToken(req));

			res.render("pages/job-role-create.njk", {
				pageTitle: "Kainos Careers - Add Job Role",
				options,
				formValues: {
					roleName: "",
					description: "",
					sharepointUrl: "",
					responsibilities: "",
					numberOfOpenPositions: "",
					location: "",
					closingDate: "",
					capabilityId: "",
					bandId: "",
				},
				errors: {},
			});
		} catch (_error) {
			res.status(500).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 500,
				message: "Unable to load job role options",
			});
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		const formValues = getCreateFormValues(req.body, true);
		const errors = validateCreateForm(formValues, true);

		if (!Number.isInteger(id) || id <= 0) {
			res.status(400).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 400,
				message: "Invalid job role ID",
			});
			return;
		}

		if (Object.keys(errors).length > 0) {
			const options = await getCreateJobRoleOptions(this.getJwtToken(req));
			res.status(400).render("pages/job-role-create.njk", {
				pageTitle: "Kainos Careers - Edit Job Role",
				options,
				formValues,
				errors,
				isEdit: true,
				formActionId: id,
			});
			return;
		}

		try {
			await updateJobRole(
				id,
				{
					roleName: formValues.roleName.trim(),
					description: formValues.description.trim(),
					sharepointUrl: formValues.sharepointUrl.trim(),
					responsibilities: formValues.responsibilities
						.split("\n")
						.map((responsibility) => responsibility.trim())
						.filter(Boolean),
					numberOfOpenPositions: Number(formValues.numberOfOpenPositions),
					location: formValues.location.trim(),
					closingDate: formValues.closingDate,
					capabilityId: Number(formValues.capabilityId),
					bandId: Number(formValues.bandId),
					statusId: Number(formValues.statusId),
				},
				this.getJwtToken(req),
			);
			res.redirect("/job-roles?updated=1");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to update job role";

			if (message === "Forbidden") {
				this.handleForbiddenError(res);
			} else if (message === "Unauthorized") {
				this.handleUnauthorizedError(res);
			} else if (message === "Job role not found.") {
				res.status(404).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 404,
					message: "Job role not found",
				});
			} else {
				res.status(500).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 500,
					message,
				});
			}
		}
	}

	async showEditForm(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		if (!Number.isInteger(id) || id <= 0) {
			res.status(400).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 400,
				message: "Invalid job role ID",
			});
			return;
		}

		try {
			const [jobRole, options] = await Promise.all([
				getJobRoleById(id, this.getJwtToken(req)),
				getCreateJobRoleOptions(this.getJwtToken(req)),
			]);
			if (!jobRole) {
				res.status(404).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 404,
					message: "Job role not found",
				});
				return;
			}

			res.render("pages/job-role-create.njk", {
				pageTitle: "Kainos Careers - Edit Job Role",
				options,
				isEdit: true,
				formActionId: id,
				formValues: {
					roleName: jobRole.roleName,
					description: jobRole.description,
					sharepointUrl: jobRole.sharepointUrl,
					responsibilities: jobRole.responsibilities.join("\n"),
					numberOfOpenPositions: String(jobRole.numberOfOpenPositions),
					location: jobRole.location,
					closingDate: jobRole.closingDate
						? new Date(jobRole.closingDate).toISOString().slice(0, 10)
						: "",
					capabilityId: String(jobRole.capabilityId ?? ""),
					bandId: String(jobRole.bandId ?? ""),
					statusId: String(jobRole.statusId ?? ""),
				},
				errors: {},
			});
		} catch (_error) {
			res.status(500).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 500,
				message: "Unable to load job role",
			});
		}
	}

	async delete(req: Request, res: Response): Promise<void> {
		try {
			await deleteJobRole(Number(req.params.id), this.getJwtToken(req));
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to delete job role";
			if (message === "Forbidden") this.handleForbiddenError(res);
			else if (message === "Unauthorized") this.handleUnauthorizedError(res);
			else
				res.status(500).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 500,
					message,
				});
		}
	}
}
