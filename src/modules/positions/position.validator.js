// src/modules/positions/position.validator.js
import { check, param } from "express-validator";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";

export const createPositionValidator = [
  check("name")
    .notEmpty()
    .withMessage("Position name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Position name must be between 2 and 50 characters"),

  check("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Description must be at most 200 characters"),

  check("department")
    .notEmpty()
    .withMessage("Department is required")
    .isMongoId()
    .withMessage("Invalid department ID"),

  validatorMiddleware,
];

export const updatePositionValidator = [
  param("id").isMongoId().withMessage("Invalid position ID"),

  check("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Position name must be between 2 and 50 characters"),

  check("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Description must be at most 200 characters"),

  check("department")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID"),

  validatorMiddleware,
];

export const positionIdValidator = [
  param("id").isMongoId().withMessage("Invalid position ID"),

  validatorMiddleware,
];
