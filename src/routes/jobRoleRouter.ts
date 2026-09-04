import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();
const controller = new JobRoleController();

router.use(requireAuth);
router.get("/job-roles", controller.getJobRoles.bind(controller));

router.post("/job-roles", controller.create.bind(controller));
router.post("/job-roles/:id", controller.update.bind(controller));
router.post("/job-roles/:id/delete", controller.delete.bind(controller));

router.get("/job-roles/new", controller.showCreateForm.bind(controller));
router.get("/job-roles/:id/edit", controller.showEditForm.bind(controller));
router.get("/job-roles/:id", controller.getJobRoleDetails.bind(controller));

export default router;
