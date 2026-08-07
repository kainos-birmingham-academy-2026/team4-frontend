import path from "node:path";
import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";
import registrationRoutes from "./routes/registrationRoutes";
import jobRouter from "./routes/jobRouter";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

nunjucks.configure(path.join(__dirname, "views"), {
	autoescape: true,
	express: app,
});

app.set("view engine", "njk");

app.use(express.static(path.join(__dirname, "../public")));

app.use(jobRouter);

app.use("/register", registrationRoutes);

app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
