import type { Request, Response } from "express";
import type { JobRole } from "../models/jobRole";
import {
	createJobRole,
	deleteJobRole,
	getAllJobRoles,
	getFilterOptions,
	getJobRoleById,
	getPaginatedJobRoles,
	updateJobRole,
} from "../services/jobRoleApiService";
import type { FilterOptions, JobRoleFilters } from "../types/jobRoleDTO";

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
		return value.filter((v) => typeof v === "string");
	}
	if (typeof value === "string" && value.length > 0) {
		return [value];
	}
	return [];
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

export function buildFilterQuery(filters: JobRoleFilters): string {
	const params = new URLSearchParams();

	if (filters.roleName) {
		params.append("roleName", filters.roleName);
	}
	if (filters.location) {
		params.append("location", filters.location);
	}
	for (const value of filters.capability) {
		params.append("capability", value);
	}
	for (const value of filters.band) {
		params.append("band", value);
	}
	for (const value of filters.status) {
		params.append("status", value);
	}
	if (filters.closingDate) {
		params.append("closingDate", filters.closingDate);
	}

	const query = params.toString();
	return query ? `&${query}` : "";
}

export class JobRoleController {
	private getJwtToken(req: Request): string {
		return req.session.jwtToken ?? "";
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
		const filters = extractFilters(req.query);
		const filterQuery = buildFilterQuery(filters);

		let filterOptions = EMPTY_FILTER_OPTIONS;
		try {
			filterOptions =
				(await getFilterOptions(this.getJwtToken(req))) ?? EMPTY_FILTER_OPTIONS;
		} catch (_error) {
			// A missing options list shouldn't stop the listing rendering
		}

		try {
			const data = await getPaginatedJobRoles(
				page,
				this.getJwtToken(req),
				filters,
			);
			res.render("pages/job-roles", {
				pageTitle: "Kainos Careers - Job Roles",
				jobs: data?.jobs || [],
				pagination: data?.pagination || {
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
			});
		} catch (_error) {
			// If fetching paginated job roles fails, fallback to fetching all job roles
			await this.getNonPaginatedJobRoles(req, res);
		}
	}

	async getNonPaginatedJobRoles(req: Request, res: Response): Promise<void> {
		try {
			const jobs = await getAllJobRoles(this.getJwtToken(req));
			const safeJobs = jobs || [];

			res.render("pages/job-roles", {
				pageTitle: "Kainos Careers - Job Roles",
				jobs: safeJobs,
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
			});
		} catch (_error) {
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

		let jobRole: JobRole | undefined;
		try {
			jobRole = await getJobRoleById(id, this.getJwtToken(req));
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

		res.render("pages/job-detail.njk", {
			pageTitle: `Kainos Careers - ${jobRole.roleName}`,
			job: jobRole,
		});
	}

	async create(req: Request, res: Response): Promise<void> {
		//Placeholder for creating a new job role
		try {
			await createJobRole(req.body, this.getJwtToken(req));
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to create job role";

			if (message === "Forbidden") {
				this.handleForbiddenError(res);
			} else if (message === "Unauthorized") {
				this.handleUnauthorizedError(res);
			} else {
				res.status(500).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 500,
					message: message,
				});
			}
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		try {
			await updateJobRole(
				Number(req.params.id),
				req.body,
				this.getJwtToken(req),
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to update job role";

			if (message === "Forbidden") {
				this.handleForbiddenError(res);
			} else if (message === "Unauthorized") {
				this.handleUnauthorizedError(res);
			} else {
				res.status(500).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 500,
					message: message,
				});
			}
		}
	}

	async delete(req: Request, res: Response): Promise<void> {
		try {
			await deleteJobRole(Number(req.params.id), this.getJwtToken(req));
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to delete job role";

			if (message === "Forbidden") {
				this.handleForbiddenError(res);
			} else if (message === "Unauthorized") {
				this.handleUnauthorizedError(res);
			} else {
				res.status(500).render("pages/error.njk", {
					pageTitle: "Kainos Careers - Error",
					status: 500,
					message: message,
				});
			}
		}
	}
}
