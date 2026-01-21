import { Router } from "express";
import { param, query } from "express-validator";
import * as financeController from "./finance.controller.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Company-wide financials
router.get(
  "/company",
  allowedTo("admin", "manager"),
  [
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  validatorMiddleware,
  financeController.getCompanyFinancials,
);

// Project-specific financials
router.get(
  "/project/:projectId",
  [param("projectId").isMongoId().withMessage("Invalid project ID")],
  validatorMiddleware,
  financeController.getProjectFinancials,
);

// Project employee breakdown
router.get(
  "/project/:projectId/employees",
  allowedTo("admin", "manager"),
  [param("projectId").isMongoId().withMessage("Invalid project ID")],
  validatorMiddleware,
  financeController.getProjectEmployeeBreakdown,
);

// Project client payment history
router.get(
  "/project/:projectId/payments",
  [param("projectId").isMongoId().withMessage("Invalid project ID")],
  validatorMiddleware,
  financeController.getClientPaymentHistory,
);

export default router;
