// src/modules/departments/department.validator.js
import { check, param } from "express-validator";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";

export const createDepartmentValidator = [
  check("name")
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Department name must be between 2 and 50 characters"),

  validatorMiddleware,
];

export const updateDepartmentValidator = [
  param("id").isMongoId().withMessage("Invalid department ID"),

  check("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Department name must be between 2 and 50 characters"),

  validatorMiddleware,
];

export const departmentIdValidator = [
  param("id").isMongoId().withMessage("Invalid department ID"),

  validatorMiddleware,
];
