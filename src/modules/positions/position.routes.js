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

// POST /positions - Create position (Admin only)
router.post(
  "/",
  allowedTo(USER_ROLES.ADMIN),
  createPositionValidator,
  createPosition,
);

// GET /positions/:id - Get single position
router.get("/:id", positionIdValidator, getPosition);

// PATCH /positions/:id - Update position (Admin only)
router.patch(
  "/:id",
  allowedTo(USER_ROLES.ADMIN),
  updatePositionValidator,
  updatePosition,
);

// DELETE /positions/:id - Delete position (Admin only)
router.delete(
  "/:id",
  positionIdValidator,
  allowedTo(USER_ROLES.ADMIN),
  deletePosition,
);

export default router;
