import "dotenv/config";
import path from "node:path";
import express, { type Request, type Response } from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import authRouter from "./routes/authRouter";
import chatRouter from "./routes/chatRouter";
import jobRoleRouter from "./routes/jobRoleRouter";

const isDev = process.env.NODE_ENV !== "production";
const useSecureSessionCookie =
	process.env.SESSION_COOKIE_SECURE === "true" ||
	(process.env.NODE_ENV === "production" &&
		process.env.SESSION_COOKIE_SECURE !== "false");
const app = express();

function hasAdminRole(token: string | undefined): boolean {
	if (!token) return false;

	try {
		const payload = token.split(".")[1];
		if (!payload) return false;

		const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
			role?: unknown;
		};

		return claims.role === "ADMIN";
	} catch {
		return false;
	}
}

const env = nunjucks.configure(path.join(__dirname, "views"), {
	autoescape: true,
	express: app,
	noCache: isDev,
	watch: isDev,
});

env.addFilter("formatDate", (value: string | Date) => {
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
});

app.set("view engine", "njk");

app.use(
	"/assets/js",
	express.static(path.join(process.cwd(), "dist/public/assets/js")),
);
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("trust proxy", 1);

app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "dev-session-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: useSecureSessionCookie,
			maxAge: 1000 * 60 * 60,
		},
	}),
);
app.use("/api/chat", chatRouter);

app.use((req, res, next) => {
	res.locals.isAuthenticated = Boolean(req.session.jwtToken);
	res.locals.isAdmin = hasAdminRole(req.session.jwtToken);
	res.locals.currentPath = req.path;
	next();
});

app.get("/", (_req: Request, res: Response) => {
	res.render("pages/index.njk", {
		pageTitle: "Kainos Careers - Home",
	});
});

app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

app.use(authRouter);
app.use(jobRoleRouter);

export default app;
