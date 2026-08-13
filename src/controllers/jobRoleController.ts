import type { Request, Response } from "express";
import {
	createJobRole,
	deleteJobRole,
	getAllJobRoles,
	getJobRoleById,
	getPaginatedJobRoles,
	updateJobRole,
} from "../services/jobRoleApiService";

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

	private filterJobs(
		queryValue: string,
		capabilityValue: string,
		jobs: Array<{
			roleName: string;
			capability: string;
			location: string;
		}>,
	) {
		const normalizedQuery = queryValue.toLowerCase();
		const normalizedCapability = capabilityValue.toLowerCase();

		return jobs.filter((jobRole) => {
			const roleNameMatches = jobRole.roleName
				.toLowerCase()
				.includes(normalizedQuery);
			const capabilityMatchesText = jobRole.capability
				.toLowerCase()
				.includes(normalizedQuery);
			const locationMatchesText = jobRole.location
				.toLowerCase()
				.includes(normalizedQuery);

			const queryMatches =
				normalizedQuery.length === 0 ||
				roleNameMatches ||
				capabilityMatchesText ||
				locationMatchesText;

			const capabilityMatches =
				normalizedCapability.length === 0 ||
				jobRole.capability.toLowerCase() === normalizedCapability;

			return queryMatches && capabilityMatches;
		});
	}

	private getCapabilityOptions(
		jobs: Array<{
			capability: string;
		}>,
	): string[] {
		return Array.from(
			new Set(jobs.map((jobRole) => jobRole.capability).filter(Boolean)),
		).sort((left, right) => left.localeCompare(right));
	}

	async getJobRoles(req: Request, res: Response): Promise<void> {
		const page = parseInt(req.query.page as string, 10) || 1;
		const queryValue = String(req.query.q ?? "").trim();
		const capabilityValue = String(req.query.capability ?? "").trim();

		try {
			const data = await getPaginatedJobRoles(page, this.getJwtToken(req));
			const jobs = data?.jobs || [];
			const filteredJobs = this.filterJobs(queryValue, capabilityValue, jobs);
			const capabilityOptions = this.getCapabilityOptions(jobs);

			res.render("pages/job-roles", {
				pageTitle: "Kainos Careers - Job Roles",
				jobs: filteredJobs,
				filters: {
					q: queryValue,
					capability: capabilityValue,
				},
				capabilityOptions,
				pagination: data?.pagination || {
					currentPage: 1,
					totalPages: 1,
					totalCount: 0,
					pageSize: 10,
					hasNext: false,
					hasPrev: false,
				},
			});
		} catch (_error) {
			// If fetching paginated job roles fails, fallback to fetching all job roles
			await this.getNonPaginatedJobRoles(req, res);
		}
	}

	async getNonPaginatedJobRoles(req: Request, res: Response): Promise<void> {
		const queryValue = String(req.query.q ?? "").trim();
		const capabilityValue = String(req.query.capability ?? "").trim();

		try {
			const jobs = await getAllJobRoles(this.getJwtToken(req));
			const safeJobs = jobs || [];
			const filteredJobs = this.filterJobs(
				queryValue,
				capabilityValue,
				safeJobs,
			);
			const capabilityOptions = this.getCapabilityOptions(safeJobs);

			res.render("pages/job-roles", {
				pageTitle: "Kainos Careers - Job Roles",
				jobs: filteredJobs,
				filters: {
					q: queryValue,
					capability: capabilityValue,
				},
				capabilityOptions,
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalCount: safeJobs.length,
					pageSize: safeJobs.length,
					hasNext: false,
					hasPrev: false,
				},
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

		const jobRole = await getJobRoleById(id, this.getJwtToken(req));
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
