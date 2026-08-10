import "dotenv/config";
import path from "node:path";
import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";
import jobRoleRouter from "./routes/jobRoleRouter";

const app = express();
const env = nunjucks.configure(path.join(__dirname, "views"), {
	autoescape: true,
	express: app,
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

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(jobRoleRouter);

app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
