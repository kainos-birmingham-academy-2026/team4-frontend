import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
	res.render("pages/index", {
		pageTitle: "Kainos Careers - Home",
	});
});

router.get("/register", (_req, res) => {
	res.render("pages/register", {
		pageTitle: "Kainos Careers - Register",
	});
});

router.get("/login", (_req, res) => {
	res.render("pages/login", {
		pageTitle: "Kainos Careers - Sign In",
	});
});

// Mock job data
const jobsData = [
	{
		id: 1,
		title: "Senior Software Engineer",
		department: "Engineering",
		location: "Belfast, UK",
		salary: "£60k - £80k",
		type: "Full-time",
		status: "open",
		description:
			"We're looking for an experienced Software Engineer to join our growing team. You'll work on cutting-edge technologies and lead development initiatives.",
		fullDescription:
			"Join our Engineering team as a Senior Software Engineer and lead the development of innovative solutions. You'll work with modern technologies including TypeScript, React, and AWS to build scalable applications that impact millions of users.",
		responsibilities: [
			"Lead design and implementation of new features",
			"Mentor junior developers and conduct code reviews",
			"Collaborate with product and design teams to define requirements",
			"Optimize application performance and scalability",
			"Participate in architectural decisions",
		],
		requirements: [
			"5+ years of software development experience",
			"Strong proficiency in TypeScript and Node.js",
			"Experience with React and modern web frameworks",
			"AWS or cloud platform experience",
			"Excellent problem-solving and communication skills",
		],
		skills: ["TypeScript", "React", "Node.js", "AWS"],
	},
	{
		id: 2,
		title: "Product Designer",
		department: "Design",
		location: "London, UK",
		salary: "£50k - £70k",
		type: "Full-time",
		status: "open",
		description:
			"Join our design team to create beautiful and intuitive user experiences. You'll collaborate with engineers and product managers to shape our product vision.",
		fullDescription:
			"As a Product Designer, you'll own the entire design process from research through implementation. You'll work closely with cross-functional teams to deliver user-centered solutions.",
		responsibilities: [
			"Design and prototype user interfaces and experiences",
			"Conduct user research and usability testing",
			"Create design systems and style guides",
			"Collaborate with developers to ensure design quality",
			"Iterate based on user feedback and analytics",
		],
		requirements: [
			"4+ years of product design experience",
			"Proficiency in Figma or similar tools",
			"Strong portfolio demonstrating UX/UI work",
			"Understanding of user research methodologies",
			"Experience with design systems",
		],
		skills: ["Figma", "UX Design", "Prototyping", "User Research"],
	},
	{
		id: 3,
		title: "Data Engineer",
		department: "Engineering",
		location: "Belfast, UK",
		salary: "£55k - £75k",
		type: "Full-time",
		status: "open",
		description:
			"Help us build scalable data infrastructure. You'll design and implement systems that process and analyze data at scale.",
		fullDescription:
			"Build and maintain the data infrastructure that powers our business intelligence and analytics. You'll work with large-scale data systems and cutting-edge technologies.",
		responsibilities: [
			"Design and build data pipelines and ETL processes",
			"Optimize data storage and retrieval systems",
			"Implement data quality and monitoring solutions",
			"Collaborate with analytics and ML teams",
			"Ensure data security and compliance",
		],
		requirements: [
			"4+ years of data engineering experience",
			"Proficiency in Python and SQL",
			"Experience with Apache Spark or similar tools",
			"Knowledge of cloud platforms (AWS, GCP, Azure)",
			"Understanding of data warehousing concepts",
		],
		skills: ["Python", "SQL", "Apache Spark", "Cloud Platforms"],
	},
	{
		id: 4,
		title: "Management Consultant",
		department: "Consulting",
		location: "Multiple Locations",
		salary: "£45k - £65k",
		type: "Full-time",
		status: "open",
		description:
			"Work with leading organizations to solve complex business challenges. You'll provide strategic advice and drive digital transformation initiatives.",
		fullDescription:
			"Join our Consulting team and partner with Fortune 500 companies to solve complex business problems through digital transformation and strategic initiatives.",
		responsibilities: [
			"Conduct business analysis and strategy development",
			"Lead client engagements and project delivery",
			"Create presentations and business cases",
			"Mentor junior consultants",
			"Develop innovative solutions to client challenges",
		],
		requirements: [
			"3+ years of management consulting experience",
			"Strong analytical and problem-solving skills",
			"Excellent presentation and client communication",
			"Experience with business case development",
			"Ability to work in fast-paced environments",
		],
		skills: ["Strategic Analysis", "Project Management", "Communication"],
	},
	{
		id: 5,
		title: "QA Automation Engineer",
		department: "Engineering",
		location: "Belfast, UK",
		salary: "£45k - £60k",
		type: "Full-time",
		status: "open",
		description:
			"Build automated testing frameworks to ensure quality across our products. You'll collaborate with developers to improve our testing processes.",
		fullDescription:
			"Develop and maintain comprehensive automated testing solutions to ensure the highest quality of our products. You'll be key in establishing testing best practices across the organization.",
		responsibilities: [
			"Design and implement automated test frameworks",
			"Develop test strategies and plans",
			"Collaborate with developers on test implementation",
			"Maintain CI/CD pipeline testing infrastructure",
			"Report and track quality metrics",
		],
		requirements: [
			"3+ years of QA automation experience",
			"Proficiency in test automation frameworks",
			"Strong JavaScript/Python skills",
			"Experience with CI/CD platforms",
			"Knowledge of testing methodologies",
		],
		skills: ["Selenium", "Test Automation", "JavaScript", "CI/CD"],
	},
	{
		id: 6,
		title: "UX Researcher",
		department: "Design",
		location: "London, UK",
		salary: "£48k - £68k",
		type: "Full-time",
		status: "open",
		description:
			"Conduct user research to inform product decisions. You'll gather insights, conduct interviews, and create actionable recommendations.",
		fullDescription:
			"Lead user research initiatives that shape product strategy. You'll conduct studies, analyze data, and translate findings into actionable recommendations.",
		responsibilities: [
			"Plan and conduct user research studies",
			"Perform qualitative and quantitative analysis",
			"Create research reports and presentations",
			"Collaborate with product and design teams",
			"Build and maintain research methodologies",
		],
		requirements: [
			"3+ years of UX research experience",
			"Proficiency in research methodologies",
			"Experience with data analysis tools",
			"Strong presentation and communication skills",
			"Understanding of product development processes",
		],
		skills: ["User Research", "Data Analysis", "Qualitative Research"],
	},
];

router.get("/job-roles", (_req, res) => {
	res.render("pages/job-roles", {
		pageTitle: "Kainos Careers - Job Roles",
		jobs: jobsData,
	});
});

router.get("/job-roles/:id", (req, res) => {
	const job = jobsData.find((j) => j.id === parseInt(req.params.id, 10));

	if (!job) {
		return res.status(404).render("pages/404", {
			pageTitle: "Job Not Found",
		});
	}

	res.render("pages/job-detail", {
		pageTitle: `Kainos Careers - ${job.title}`,
		job,
	});
});

export default router;
