import type { Request, Response } from "express";
import { getAllJobRoles, getJobRoleById } from "../services/jobRoleApiService";

export class JobRoleController {
	getHome(_req: Request, res: Response) {
		res.render("pages/index", {
			pageTitle: "Kainos Careers - Home",
		});
	}

	getRegister(_req: Request, res: Response) {
		res.render("pages/register", {
			pageTitle: "Kainos Careers - Register",
		});
	}

	getLogin(req: Request, res: Response) {
		const registered = req.query.registered === "1";

		res.render("pages/login", {
			pageTitle: "Kainos Careers - Sign In",
			registrationSuccessMessage: registered
				? "Registration successful. You can now sign in."
				: undefined,
		});
	}

	async getJobRoles(_req: Request, res: Response): Promise<void> {
		const jobRoles = await getAllJobRoles();
		res.render("pages/job-roles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: jobRoles,
		});
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

		const jobRole = await getJobRoleById(id);
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
