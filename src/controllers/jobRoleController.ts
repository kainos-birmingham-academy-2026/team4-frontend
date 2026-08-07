import type { Request, Response } from "express";
import { getAllJobRoles } from "../services/jobRoleApiService";

export class JobRoleController {
	async getHome(req: Request, res: Response): Promise<void> {
		res.render("pages/index", {
			pageTitle: "Kainos Careers - Home",
		});
	}

	async getRegister(req: Request, res: Response): Promise<void> {
		res.render("pages/register", {
			pageTitle: "Kainos Careers - Register",
		});
	}

	async getLogin(req: Request, res: Response): Promise<void> {
		res.render("pages/login", {
			pageTitle: "Kainos Careers - Sign In",
		});
	}

	async getJobRoles(req: Request, res: Response): Promise<void> {
		const jobRoles = await getAllJobRoles();
		res.render("pages/jobRoles", {
			pageTitle: "Kainos Careers - Job Roles",
			jobs: jobRoles,
		});
	}
}
