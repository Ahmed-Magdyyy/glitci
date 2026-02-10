// src/modules/positions/position.routes.js
import { Router } from "express";
import {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
} from "./position.controller.js";
import {
  createPositionValidator,
  updatePositionValidator,
  positionIdValidator,
} from "./position.validator.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

router.use(protect);

// GET /positions - List positions
router.get("/", getPositions);

// POST /positions - Create position
router.post(
  "/",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  createPositionValidator,
  createPosition,
);

// GET /positions/:id - Get single position
router.get(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  positionIdValidator,
  getPosition,
);

// PATCH /positions/:id - Update position
router.patch(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  updatePositionValidator,
  updatePosition,
);

// DELETE /positions/:id - Delete position
router.delete(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  positionIdValidator,
  deletePosition,
);

export default router;
