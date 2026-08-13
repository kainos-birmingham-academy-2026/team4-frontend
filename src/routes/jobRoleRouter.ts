import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();
const controller = new JobRoleController();

router.use(requireAuth);
router.get("/job-roles", controller.getJobRoles.bind(controller));
router.get("/job-roles/:id", controller.getJobRoleDetails.bind(controller));

export default router;
