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
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";
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
  .get(listProjectsValidator, validatorMiddleware, getProjects)
  .post(
    allowedTo("admin", "manager"),
    createProjectValidator,
    validatorMiddleware,
    createProject,
  );

router
  .route("/:id")
  .get(projectIdValidator, validatorMiddleware, getProject)
  .patch(
    allowedTo("admin", "manager"),
    updateProjectValidator,
    validatorMiddleware,
    updateProject,
  )
  .delete(
    allowedTo("admin", "manager"),
    projectIdValidator,
    validatorMiddleware,
    deleteProject,
  );

router.patch(
  "/:id/toggle-active",
  allowedTo("admin"),
  projectIdValidator,
  validatorMiddleware,
  toggleProjectActive,
);

export default router;
