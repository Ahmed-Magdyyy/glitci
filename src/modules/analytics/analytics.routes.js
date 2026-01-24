import { Router } from "express";
import { getOverview, getStats } from "./analytics.controller.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";
import { overviewValidator } from "./analytics.validator.js";
import { currencyMiddleware } from "../../shared/middlewares/currencyMiddleware.js";

const router = Router();

// All analytics routes require authentication
router.use(protect);
router.use(currencyMiddleware);

// Overview - time-based financial data (from/to optional, defaults to this month)
router.get(
  "/overview",
  allowedTo("admin", "manager"),
  overviewValidator,
  validatorMiddleware,
  getOverview,
);

// Stats - static counts (no time filter needed)
router.get("/stats", allowedTo("admin", "manager"), getStats);

export default router;
