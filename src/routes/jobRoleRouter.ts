import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";

const router = Router();
const controller = new JobRoleController();

router.get("/", controller.getHome);
router.get("/register", controller.getRegister);
router.get("/login", controller.getLogin);
router.get("/job-roles", controller.getJobRoles);

export default router;
