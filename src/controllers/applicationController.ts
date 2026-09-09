import type { Request, Response } from "express";
import {
	ApplicationServiceError,
	submitApplication,
} from "../services/applicationApiService";
import { getJobRoleById } from "../services/jobRoleApiService";

export class ApplicationController {
	private getJwtToken(req: Request): string {
		return req.session.jwtToken ?? "";
	}

	async showApplicationForm(req: Request, res: Response): Promise<void> {
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

		if (jobRole.status !== "Open" || jobRole.numberOfOpenPositions <= 0) {
			res.redirect(`/job-roles/${id}`);
			return;
		}

		res.render("pages/job-apply.njk", {
			pageTitle: `Kainos Careers - Apply for ${jobRole.roleName}`,
			job: jobRole,
			formValues: { message: "" },
		});
	}

	async submitApplication(req: Request, res: Response): Promise<void> {
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

		const message = String(req.body.message ?? "").trim();
		if (!message) {
			res.status(400).render("pages/job-apply.njk", {
				pageTitle: `Kainos Careers - Apply for ${jobRole.roleName}`,
				job: jobRole,
				errorMessage: "Enter a message before submitting your application",
				formValues: { message },
			});
			return;
		}

		try {
			await submitApplication(id, message, this.getJwtToken(req));
			res.redirect(`/job-roles/${id}`);
		} catch (error) {
			const errorMessage =
				error instanceof ApplicationServiceError
					? error.message
					: "Something went wrong while submitting your application";

			res.status(400).render("pages/job-apply.njk", {
				pageTitle: `Kainos Careers - Apply for ${jobRole.roleName}`,
				job: jobRole,
				errorMessage,
				formValues: { message },
			});
		}
	}
}
