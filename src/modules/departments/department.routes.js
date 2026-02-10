// src/modules/departments/department.routes.js
import { Router } from "express";
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  toggleDepartmentActive,
  deleteDepartment,
} from "./department.controller.js";
import {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdValidator,
} from "./department.validator.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

// All routes require authentication
router.use(protect);

// GET /departments - List departments (isActive=true by default)
router.get("/", getDepartments);

// POST /departments - Create department (Admin only)
router.post(
  "/",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  createDepartmentValidator,
  createDepartment,
);

// GET /departments/:id - Get single department
router.get(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  departmentIdValidator,
  getDepartment,
);

// PATCH /departments/:id - Update department (Admin only)
router.patch(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  updateDepartmentValidator,
  updateDepartment,
);

// PATCH /departments/:id/toggle-active - Toggle department status (Admin only)
router.patch(
  "/:id/toggle-active",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  departmentIdValidator,
  toggleDepartmentActive,
);

// DELETE /departments/:id - Delete department permanently (Admin only)
router.delete(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  departmentIdValidator,
  deleteDepartment,
);

export default router;
