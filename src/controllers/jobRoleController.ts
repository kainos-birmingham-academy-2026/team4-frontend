import type { Request, Response } from "express";
import { getAllJobRoles } from "../services/jobRoleApiService";

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
}
