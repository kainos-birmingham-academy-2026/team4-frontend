import path from "node:path";
import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";

const app = express();

nunjucks.configure(path.join(__dirname, "views"), {
	autoescape: true,
	express: app,
});

app.set("view engine", "njk");

app.get("/", (_req: Request, res: Response) => {
	res.render("index", { message: "hello world" });
});

app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
