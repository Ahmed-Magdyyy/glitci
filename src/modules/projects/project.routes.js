import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  toggleProjectActive,
  updateProject,
} from "./project.controller.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
  listProjectsValidator,
} from "./project.validator.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Project CRUD
router
  .route("/")
  .get(listProjectsValidator, getProjects)
  .post(allowedTo("admin", "manager"), createProjectValidator, createProject);

router
  .route("/:id")
  .get(projectIdValidator, getProject)
  .patch(allowedTo("admin", "manager"), updateProjectValidator, updateProject)
  .delete(allowedTo("admin", "manager"), projectIdValidator, deleteProject);

router.patch(
  "/:id/toggle-active",
  allowedTo("admin"),
  projectIdValidator,
  toggleProjectActive,
);

export default router;
