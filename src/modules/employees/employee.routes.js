// src/modules/employees/employee.routes.js
import { Router } from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  toggleEmployeeActive,
  deleteEmployee,
} from "./employee.controller.js";
import {
  createEmployeeValidator,
  updateEmployeeValidator,
  employeeIdValidator,
} from "./employee.validator.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

router.use(protect);

// GET /employees - List employees (isActive=true by default)
router.get("/", getEmployees);

// POST /employees - Create employee (Admin only)
router.post(
  "/",
  allowedTo(USER_ROLES.ADMIN),
  createEmployeeValidator,
  createEmployee,
);

// GET /employees/:id - Get single employee
router.get("/:id", employeeIdValidator, getEmployee);

// PATCH /employees/:id - Update employee (Admin only)
router.patch(
  "/:id",
  allowedTo(USER_ROLES.ADMIN),
  updateEmployeeValidator,
  updateEmployee,
);

// PATCH /employees/:id/toggle-active - Toggle employee status (Admin only)
router.patch(
  "/:id/toggle-active",
  employeeIdValidator,
  allowedTo(USER_ROLES.ADMIN),
  toggleEmployeeActive,
);

// DELETE /employees/:id - Delete employee permanently (Admin only)
router.delete(
  "/:id",
  employeeIdValidator,
  allowedTo(USER_ROLES.ADMIN),
  deleteEmployee,
);

export default router;
