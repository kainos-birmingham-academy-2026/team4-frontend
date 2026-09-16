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
	fitScore: number | null;
	fitSummary: string | null;
	fitStrengths: string[];
	fitGaps: string[];
	fitStatus: "Complete" | "Unavailable" | "Failed" | null;
	fitAssessedAt: string | null;
	fitModel: string | null;
	fitPromptVersion: string | null;
}

export interface BulkFitAssessmentResponse {
	processed: number;
	completed: number;
	unavailable: number;
	failed: number;
	skippedComplete: number;
}
