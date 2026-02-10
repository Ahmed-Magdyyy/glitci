// src/modules/clients/client.routes.js
import { Router } from "express";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  toggleClientActive,
  deleteClient,
} from "./client.controller.js";
import {
  createClientValidator,
  updateClientValidator,
  clientIdValidator,
} from "./client.validator.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

// All routes require authentication
router.use(protect);

// GET /clients - List clients (isActive=true by default)
router.get("/", getClients);

// POST /clients - Create client
router.post(
  "/",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATION),
  createClientValidator,
  createClient,
);

// GET /clients/:id - Get single client
router.get("/:id", clientIdValidator, getClient);

// PATCH /clients/:id - Update client (all fields except isActive)
router.patch(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATION),
  updateClientValidator,
  updateClient,
);

// PATCH /clients/:id/toggle-active - Toggle client active status (Admin only)
router.patch(
  "/:id/toggle-active",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATION),
  clientIdValidator,
  toggleClientActive,
);

// DELETE /clients/:id - Delete client permanently (Admin only)
router.delete(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATION),
  clientIdValidator,
  deleteClient,
);

export default router;
