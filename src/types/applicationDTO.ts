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
