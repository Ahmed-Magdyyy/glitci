import { query } from "express-validator";

export const overviewValidator = [
  query("from")
    .optional()
    .isISO8601()
    .withMessage("Invalid 'from' date format. Use ISO8601 (YYYY-MM-DD)"),
  query("to")
    .optional()
    .isISO8601()
    .withMessage("Invalid 'to' date format. Use ISO8601 (YYYY-MM-DD)"),
];
