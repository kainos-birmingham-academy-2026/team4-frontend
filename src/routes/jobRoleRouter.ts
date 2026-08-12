import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();
const controller = new JobRoleController();

//TODO: separate authRouter and jobRoleRouter
router.get("/", controller.getHome.bind(controller));
//router.get("/register", controller.getRegister.bind(controller));
router.use(requireAuth);
router.get("/job-roles", controller.getJobRoles.bind(controller));
router.get("/job-roles/:id", controller.getJobRoleDetails.bind(controller));

export default router;
