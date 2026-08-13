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

	async getJobRoles(req: Request, res: Response): Promise<void> {
		const page = parseInt(req.query.page as string) || 1;
		try {
			const data = await getPaginatedJobRoles(page, this.getJwtToken(req));
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
			});
		} catch (error) {
			// If fetching paginated job roles fails, fallback to fetching all job roles
			await this.getNonPaginatedJobRoles(req, res);
		}
	}

	async getNonPaginatedJobRoles(req: Request, res: Response): Promise<void> {
		try {
			const jobs = await getAllJobRoles(this.getJwtToken(req));
			res.render("pages/job-roles", {
				pageTitle: "Kainos Careers - Job Roles",
				jobs: jobs || [],
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalCount: jobs?.length || 0,
					pageSize: jobs?.length || 0,
					hasNext: false,
					hasPrev: false,
				},
			});
		} catch (error) {
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
