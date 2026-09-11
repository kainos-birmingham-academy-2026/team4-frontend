import type { Request, Response } from "express";
import {
	ApplicationServiceError,
	assessApplication,
	getMyApplications,
	submitApplication,
} from "../services/applicationApiService";
import { getJobRoleById } from "../services/jobRoleApiService";

export class ApplicationController {
	private getJwtToken(req: Request): string {
		return req.session.jwtToken ?? "";
	}

	async showMyApplications(req: Request, res: Response): Promise<void> {
		try {
			const applications = await getMyApplications(this.getJwtToken(req));
			res.render("pages/my-applications.njk", {
				pageTitle: "Kainos Careers - My Applications",
				applications,
			});
		} catch (error) {
			const status =
				error instanceof ApplicationServiceError && error.statusCode
					? error.statusCode
					: 500;
			const message =
				error instanceof ApplicationServiceError
					? error.message
					: "Unable to load your applications";

			res.status(status).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status,
				message,
			});
		}
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

	async assessApplication(req: Request, res: Response): Promise<void> {
		const jobRoleId = Number(req.params.id);
		const applicationId = Number(req.params.applicationId);
		const action = req.params.action;

		if (
			!Number.isInteger(jobRoleId) ||
			jobRoleId <= 0 ||
			!Number.isInteger(applicationId) ||
			applicationId <= 0 ||
			(action !== "hire" && action !== "reject")
		) {
			res.status(400).render("pages/error.njk", {
				pageTitle: "Kainos Careers - Error",
				status: 400,
				message: "Invalid application assessment request",
			});
			return;
		}

		try {
			await assessApplication(applicationId, action, this.getJwtToken(req));
			res.redirect(`/job-roles/${jobRoleId}?assessed=${action}`);
		} catch (error) {
			if (error instanceof ApplicationServiceError) {
				if (error.statusCode === 401 || error.statusCode === 403) {
					res.status(error.statusCode).render("pages/login.njk", {
						pageTitle: "Kainos Careers - Login",
						status: error.statusCode,
						message: error.message,
					});
					return;
				}

				res.redirect(
					`/job-roles/${jobRoleId}?assessmentError=${encodeURIComponent(error.message)}`,
				);
				return;
			}

			res.redirect(
				`/job-roles/${jobRoleId}?assessmentError=${encodeURIComponent(
					"Unable to assess application",
				)}`,
			);
		}
	}
}
