import type { Request, Response } from "express";
import {
	getAllJobRoles,
	getJobRoleById,
	getPaginatedJobRoles,
} from "../services/jobRoleApiService";

export class JobRoleController {
	private getJwtToken(req: Request): string {
		return req.session.jwtToken ?? "";
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
}
