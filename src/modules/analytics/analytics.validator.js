import { query } from "express-validator";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";

export const overviewValidator = [
  query("lifetime")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Lifetime must be 'true' or 'false'"),
  query("from")
    .optional()
    .isISO8601()
    .withMessage("Invalid 'from' date format. Use ISO8601 (YYYY-MM-DD)"),
  query("to")
    .optional()
    .isISO8601()
    .withMessage("Invalid 'to' date format. Use ISO8601 (YYYY-MM-DD)"),

  validatorMiddleware,
];
