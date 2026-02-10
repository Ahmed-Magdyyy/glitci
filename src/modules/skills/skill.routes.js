// src/modules/skills/skill.routes.js
import { Router } from "express";
import {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from "./skill.controller.js";
import {
  createSkillValidator,
  updateSkillValidator,
  skillIdValidator,
} from "./skill.validator.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const router = Router();

router.use(protect);

// GET /skills - List skills
router.get("/", getSkills);

// POST /skills - Create skill(s) (Admin only)
router.post(
  "/",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  createSkillValidator,
  createSkill,
);

// GET /skills/:id - Get single skill
router.get("/:id", skillIdValidator, getSkill);

// PATCH /skills/:id - Update skill (Admin only)
router.patch(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  updateSkillValidator,
  updateSkill,
);

// DELETE /skills/:id - Delete skill (Admin only)
router.delete(
  "/:id",
  allowedTo(USER_ROLES.ADMIN, USER_ROLES.OPERATION),
  skillIdValidator,
  deleteSkill,
);

export default router;
