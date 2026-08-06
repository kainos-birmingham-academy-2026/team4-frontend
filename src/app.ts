import path from "node:path";
import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";
import registrationRoutes from "./routes/registrationRoutes";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

nunjucks.configure(path.join(__dirname, "views"), {
	autoescape: true,
	express: app,
});

app.set("view engine", "njk");

app.get("/", (req: Request, res: Response) => {
	const registered = req.query.registered === "1";

	res.render("index", {
		message: "hello world",
		registrationSuccessMessage: registered
			? "Registration successful. You can now sign in."
			: undefined,
	});
});

app.use("/register", registrationRoutes);

app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "UP",
		time: new Date().toISOString(),
	});
});

export default app;
