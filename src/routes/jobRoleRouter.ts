import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();
const controller = new JobRoleController();
const applicationController = new ApplicationController();

router.use(requireAuth);
router.get("/job-roles", controller.getJobRoles.bind(controller));

router.post("/job-roles", controller.create.bind(controller));
router.post("/job-roles/:id", controller.update.bind(controller));
router.post("/job-roles/:id/delete", controller.delete);

router.get("/job-roles/new", controller.showCreateForm.bind(controller));
router.get("/job-roles/:id/edit", controller.showEditForm.bind(controller));
router.get("/job-roles/:id", controller.getJobRoleDetails.bind(controller));
router.get(
	"/job-roles/:id/apply",
	applicationController.showApplicationForm.bind(applicationController),
);
router.post(
	"/job-roles/:id/apply",
	applicationController.submitApplication.bind(applicationController),
);

export default router;
