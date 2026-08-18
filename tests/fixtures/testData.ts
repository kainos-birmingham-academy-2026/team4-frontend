export const homepageContent = {
	title: "Kainos Careers - Home",
	eyebrow: "Careers at Kainos",
	heading: "Build your career on work that matters",
	browseRolesLink: "Browse open roles",
	chat: {
		launcher: "Ask about roles",
		dialog: "Role discovery assistant",
		close: "Close chat",
		engineeringPrompt: "Engineering roles",
		engineeringMessage: "Show me open roles in Engineering.",
		response: "Engineering roles could be a great fit.",
		unavailableMessage:
			"Sorry, I'm having trouble connecting. Please try again.",
	},
} as const;

export const testUser = {
	email: "tester@example.com",
	password: "Password123!",
	token: "e2e-test-token",
} as const;

export const mockJobRole = {
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "London",
	capability: "Engineering",
	band: "Band 2",
	closingDate: "2026-12-31T00:00:00.000Z",
	status: "Open",
	description:
		"Build reliable software that helps Kainos customers solve meaningful problems.",
	responsibilities: [
		"Develop and maintain software applications",
		"Collaborate with cross-functional teams",
	],
	sharepointUrl: "https://example.com/software-engineer",
	numberOfOpenPositions: 3,
} as const;

export const mockJobRoles = [
	mockJobRole,
	{
		jobRoleId: 2,
		roleName: "Data Analyst",
		location: "Belfast",
		capability: "Data",
		band: "Band 3",
		closingDate: "2026-11-30T00:00:00.000Z",
		status: "Open",
		description:
			"Turn data into useful insight for Kainos teams and customers.",
		responsibilities: ["Analyse data", "Share clear recommendations"],
		sharepointUrl: "https://example.com/data-analyst",
		numberOfOpenPositions: 2,
	},
	{
		jobRoleId: 3,
		roleName: "Delivery Manager",
		location: "London",
		capability: "Delivery",
		band: "Band 4",
		closingDate: "2026-10-31T00:00:00.000Z",
		status: "Closed",
		description: "Lead delivery teams that create valuable digital services.",
		responsibilities: ["Lead delivery", "Support project teams"],
		sharepointUrl: "https://example.com/delivery-manager",
		numberOfOpenPositions: 0,
	},
] as const;

export const jobRoleDetailContent = {
	listHeading: "Explore Job Roles",
	aboutHeading: "About This Role",
	locationLabel: "Location",
	bandLabel: "Band",
	capabilityLabel: "Capability",
	openPositions: `We have ${mockJobRole.numberOfOpenPositions} open positions for this role.`,
} as const;
