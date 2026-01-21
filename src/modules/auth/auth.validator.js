import { check } from "express-validator";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";

// export const registerValidator = [
//   check("name")
//     .notEmpty()
//     .withMessage("Name is required")
//     .isLength({ min: 3, max: 50 })
//     .withMessage("Name must be between 3 and 50 characters"),

//   check("email")
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Invalid email format"),

//   check("phone").optional().isMobilePhone().withMessage("Invalid phone number"),

//   check("password")
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters"),

//   validatorMiddleware,
// ];

export const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  check("password").notEmpty().withMessage("Password is required"),

  validatorMiddleware,
];

export const changePasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];

export const forgotPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  validatorMiddleware,
];

export const verifyResetCodeValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  check("resetCode")
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 digits"),

  validatorMiddleware,
];

export const resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];
