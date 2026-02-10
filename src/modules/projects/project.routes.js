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
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

router.use(protect);

// Project CRUD
router
  .route("/")
  .get(listProjectsValidator, getProjects)
  .post(
    allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
    createProjectValidator,
    createProject,
  );

router
  .route("/:id")
  .get(projectIdValidator, getProject)
  .patch(
    allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
    updateProjectValidator,
    updateProject,
  )
  .delete(
    allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
    projectIdValidator,
    deleteProject,
  );

router.patch(
  "/:id/toggle-active",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  projectIdValidator,
  toggleProjectActive,
);

export default router;
