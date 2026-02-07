import { Router } from "express";
import {
  getProjectFinancials,
  getProjectEmployeeBreakdown,
  getClientPaymentHistory,
} from "./finance.controller.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { projectIdValidator } from "./finance.validator.js";

const router = Router();

router.use(protect, allowedTo("admin", "manager"));

// Project-specific financials
router.get("/project/:projectId", projectIdValidator, getProjectFinancials);

// Project employee payments breakdown
router.get(
  "/project/:projectId/payments/employees",
  projectIdValidator,
  getProjectEmployeeBreakdown,
);

// Project client payment history
router.get(
  "/project/:projectId/payments/client",
  projectIdValidator,
  getClientPaymentHistory,
);

export default router;
