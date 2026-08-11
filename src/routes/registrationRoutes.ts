import { Router } from "express";
import { RegistrationController } from "../controllers/registrationController";

const registrationRoutes = Router();
const controller = new RegistrationController();

registrationRoutes.get("/", (req, res) => controller.showForm(req, res));
registrationRoutes.post("/", (req, res) =>
	controller.submitRegistration(req, res),
);

export default registrationRoutes;
