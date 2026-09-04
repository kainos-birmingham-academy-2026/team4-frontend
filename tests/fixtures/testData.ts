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
	token: "eyJhbGciOiJub25lIn0.eyJyb2xlIjoiVVNFUiJ9.",
	role: "USER",
} as const;

export const adminUser = {
	email: "admin@example.com",
	password: "AdminPassword123!",
	token: "eyJhbGciOiJub25lIn0.eyJyb2xlIjoiQURNSU4ifQ.",
	role: "ADMIN",
} as const;

export const mockJobRole = {
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "London",
	capability: "Engineering",
	capabilityId: 1,
	band: "Band 2",
	bandId: 1,
	closingDate: "2026-12-31T00:00:00.000Z",
	status: "Open",
	statusId: 1,
	description:
		"Build reliable software that helps Kainos customers solve meaningful problems.",
	responsibilities: [
		"Develop and maintain software applications",
		"Collaborate with cross-functional teams",
	],
	sharepointUrl: "https://example.com/software-engineer",
	numberOfOpenPositions: 3,
} as const;

const featuredJobRoles = [
	mockJobRole,
	{
		jobRoleId: 2,
		roleName: "Data Analyst",
		location: "Belfast",
		capability: "Data",
		capabilityId: 2,
		band: "Band 3",
		bandId: 2,
		closingDate: "2026-11-30T00:00:00.000Z",
		status: "Open",
		statusId: 1,
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
		capabilityId: 3,
		band: "Band 4",
		bandId: 3,
		closingDate: "2026-10-31T00:00:00.000Z",
		status: "Closed",
		statusId: 2,
		description: "Lead delivery teams that create valuable digital services.",
		responsibilities: ["Lead delivery", "Support project teams"],
		sharepointUrl: "https://example.com/delivery-manager",
		numberOfOpenPositions: 0,
	},
];

// Filler roles so pagination has more than five full pages to move through.
const paginationJobRoles = Array.from({ length: 57 }, (_, index) => {
	const jobRoleId = index + featuredJobRoles.length + 1;
	return {
		jobRoleId,
		roleName: `Platform Specialist ${jobRoleId}`,
		location: "Belfast",
		capability: "Platforms",
		band: "Band 2",
		closingDate: "2027-09-30T00:00:00.000Z",
		status: "Open",
		description: "Keep Kainos platforms reliable for customer teams.",
		responsibilities: ["Support platform services", "Improve automation"],
		sharepointUrl: `https://example.com/platform-specialist-${jobRoleId}`,
		numberOfOpenPositions: 1,
	};
});

export const mockJobRoles = [...featuredJobRoles, ...paginationJobRoles];

const jobRolePageSize = 10;

export const jobRoleListContent = {
	pageSize: jobRolePageSize,
	totalRoles: mockJobRoles.length,
	totalPages: Math.ceil(mockJobRoles.length / jobRolePageSize),
} as const;

export const jobRoleDetailContent = {
	listHeading: "Explore Job Roles",
	aboutHeading: "About This Role",
	locationLabel: "Location",
	bandLabel: "Band",
	capabilityLabel: "Capability",
	openPositions: `We have ${mockJobRole.numberOfOpenPositions} open positions for this role.`,
} as const;
