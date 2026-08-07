import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { getAllJobRoles } from "../services/jobRoleApiService";

const router = Router();
const controller = new JobRoleController();

router.get("/", (req, res) => controller.getHome(req, res));
router.get("/register", (req, res) => controller.getRegister(req, res));
router.get("/login", (req, res) => controller.getLogin(req, res));
router.get("/job-roles", async (req, res) => controller.getJobRoles(req, res));

export default router;
