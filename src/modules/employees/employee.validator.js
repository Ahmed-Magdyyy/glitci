// src/modules/employees/employee.validator.js
import { check, param } from "express-validator";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";
import { EMPLOYMENT_TYPE } from "../../shared/constants/employee.enums.js";

export const createEmployeeValidator = [
  // User fields
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  check("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),

  // Employee fields
  check("department")
    .notEmpty()
    .withMessage("Department is required")
    .isMongoId()
    .withMessage("Invalid department ID"),

  check("position")
    .notEmpty()
    .withMessage("Position is required")
    .isMongoId()
    .withMessage("Invalid position ID"),

  check("skills").optional().isArray().withMessage("Skills must be an array"),

  check("skills.*").optional().isMongoId().withMessage("Invalid skill ID"),

  check("employmentType")
    .optional()
    .isIn(Object.values(EMPLOYMENT_TYPE))
    .withMessage(
      `Employment type must be one of: ${Object.values(EMPLOYMENT_TYPE).join(", ")}`,
    ),

  validatorMiddleware,
];

export const updateEmployeeValidator = [
  param("id").isMongoId().withMessage("Invalid employee ID"),

  // User fields
  check("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  check("email").optional().isEmail().withMessage("Invalid email format"),

  check("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),

  // Employee profile fields
  check("department")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID"),

  check("position").optional().isMongoId().withMessage("Invalid position ID"),

  check("skills").optional().isArray().withMessage("Skills must be an array"),

  check("skills.*").optional().isMongoId().withMessage("Invalid skill ID"),

  check("employmentType")
    .optional()
    .isIn(Object.values(EMPLOYMENT_TYPE))
    .withMessage(
      `Employment type must be one of: ${Object.values(EMPLOYMENT_TYPE).join(", ")}`,
    ),

  validatorMiddleware,
];

export const employeeIdValidator = [
  param("id").isMongoId().withMessage("Invalid employee ID"),

  validatorMiddleware,
];
