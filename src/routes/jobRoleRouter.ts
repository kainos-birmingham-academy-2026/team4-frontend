import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";

const router = Router();
const controller = new JobRoleController();

//TODO: separate authRouter and jobRoleRouter
router.get("/", controller.getHome);
router.get("/register", controller.getRegister);
router.get("/login", controller.getLogin);
router.get("/job-roles", controller.getJobRoles);
router.get("/job-roles/:id", controller.getJobRoleDetails);

export default router;
