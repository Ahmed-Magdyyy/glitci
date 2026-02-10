import { Router } from "express";
import { getOverview, getStats } from "./analytics.controller.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { overviewValidator } from "./analytics.validator.js";
import { currencyMiddleware } from "../../shared/middlewares/currencyMiddleware.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

// All analytics routes require authentication
router.use(protect);
router.use(currencyMiddleware);

// Overview - time-based financial data (from/to optional, defaults to this month)
router.get(
  "/overview",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  overviewValidator,
  getOverview,
);

// Stats - static counts (no time filter needed)
router.get("/stats", allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER), getStats);

export default router;
