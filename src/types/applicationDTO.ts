export interface ApplicationResponse {
	applicationId: number;
	jobRoleId: number;
	userId: number;
	roleName: string;
	status: string;
	createdAt: string;
}

export interface ApplicationSummary {
	applicationId: number;
	jobRoleId: number;
	roleName: string;
	status: string;
	createdAt: string;
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
