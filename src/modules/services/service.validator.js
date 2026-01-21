// src/modules/services/service.validator.js
import { check, param } from "express-validator";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";

export const createServiceValidator = [
  check("name")
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Service name must be between 2 and 50 characters"),

  check("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters"),

  check("department")
    .notEmpty()
    .withMessage("Department is required")
    .isMongoId()
    .withMessage("Invalid department ID"),

  validatorMiddleware,
];

export const updateServiceValidator = [
  param("id").isMongoId().withMessage("Invalid service ID"),

  check("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Service name must be between 2 and 50 characters"),

  check("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters"),

  check("department")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID"),

  validatorMiddleware,
];

export const serviceIdValidator = [
  param("id").isMongoId().withMessage("Invalid service ID"),

  validatorMiddleware,
];
