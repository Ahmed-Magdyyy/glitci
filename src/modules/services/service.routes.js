// src/modules/services/service.routes.js
import { Router } from "express";
import {
  getServices,
  getService,
  createService,
  updateService,
  toggleServiceActive,
  deleteService,
} from "./service.controller.js";
import {
  createServiceValidator,
  updateServiceValidator,
  serviceIdValidator,
} from "./service.validator.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

router.use(protect);

// GET /services - List services
router.get("/", getServices);

// POST /services - Create service (Admin only)
router.post(
  "/",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  createServiceValidator,
  createService,
);

// GET /services/:id - Get single service
router.get(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  serviceIdValidator,
  getService,
);

// PATCH /services/:id - Update service (Admin only)
router.patch(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  updateServiceValidator,
  updateService,
);

// PATCH /services/:id/toggle-active - Toggle service status (Admin only)
router.patch(
  "/:id/toggle-active",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  serviceIdValidator,
  toggleServiceActive,
);

// DELETE /services/:id - Delete service permanently (Admin only)
router.delete(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  serviceIdValidator,
  deleteService,
);

export default router;
