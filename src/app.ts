import "dotenv/config";
import path from "node:path";
import express, { type Request, type Response } from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import authRouter from "./routes/authRouter";
import chatRouter from "./routes/chatRouter";
import jobRoleRouter from "./routes/jobRoleRouter";

const isDev = process.env.NODE_ENV !== "production";
const app = express();
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

app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "dev-session-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 60,
		},
	}),
);
app.use("/api/chat", chatRouter);

app.use((req, res, next) => {
	res.locals.isAuthenticated = Boolean(req.session.jwtToken);
	next();
});

app.get("/", (_req: Request, res: Response) => {
	res.render("pages/index.njk", {
		title: "Kainos Careers - Home",
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
