import path from "node:path";
import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";
import jobRouter from "./routes/jobRouter";

const app = express();

nunjucks.configure(path.join(__dirname, "views"), {
	autoescape: true,
	express: app,
});

app.set("view engine", "njk");

app.use(express.static(path.join(__dirname, "../public")));

app.use(jobRouter);

app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
