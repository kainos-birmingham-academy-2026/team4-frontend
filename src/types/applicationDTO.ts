export interface ApplicationResponse {
	applicationId: number;
	jobRoleId: number;
	userId: number;
	status: string;
	createdAt: string;
}

export interface ApplicationSummary {
	jobRoleId: number;
	status: string;
}

export interface ApplicationAssessment {
	applicationId: number;
	userId: number;
	applicantEmail: string;
	jobRoleId: number;
	message: string;
	status: string;
	createdAt: string;
}
