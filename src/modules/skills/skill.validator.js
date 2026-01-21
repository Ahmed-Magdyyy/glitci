// src/modules/skills/skill.validator.js
import { check, param } from "express-validator";
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";

// Validator for creating skills - { position, name: "skill" } or { position, name: ["skill1", "skill2"] }
export const createSkillValidator = [
  check("position")
    .notEmpty()
    .withMessage("Position is required")
    .isMongoId()
    .withMessage("Invalid position ID"),

  check("name")
    .notEmpty()
    .withMessage("Skill name is required")
    .custom((value) => {
      const names = Array.isArray(value) ? value : [value];
      for (const n of names) {
        if (typeof n !== "string" || n.length < 2 || n.length > 50) {
          throw new Error(
            "Each skill name must be between 2 and 50 characters",
          );
        }
      }
      return true;
    }),

  validatorMiddleware,
];

export const updateSkillValidator = [
  param("id").isMongoId().withMessage("Invalid skill ID"),

  check("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Skill name must be between 2 and 50 characters"),

  check("position").optional().isMongoId().withMessage("Invalid position ID"),

  validatorMiddleware,
];

export const skillIdValidator = [
  param("id").isMongoId().withMessage("Invalid skill ID"),

  validatorMiddleware,
];
