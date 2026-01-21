// src/modules/skills/skill.controller.js
import asyncHandler from "express-async-handler";
import {
  getSkillsService,
  getSkillByIdService,
  createSkillService,
  updateSkillService,
  deleteSkillService,
} from "./skill.service.js";

// GET /skills - List skills
export const getSkills = asyncHandler(async (req, res) => {
  const result = await getSkillsService(req.query);
  res.status(200).json(result);
});

// GET /skills/:id - Get single skill
export const getSkill = asyncHandler(async (req, res) => {
  const skill = await getSkillByIdService(req.params.id);
  res.status(200).json({ data: skill });
});

// POST /skills - Create skill(s) - accepts single skill or array
export const createSkill = asyncHandler(async (req, res) => {
  const result = await createSkillService(req.body);
  const isMultiple = Array.isArray(result);
  res.status(201).json({
    message: isMultiple
      ? `${result.length} skills created successfully`
      : "Skill created successfully",
    data: result,
  });
});

// PATCH /skills/:id - Update skill (name, position)
export const updateSkill = asyncHandler(async (req, res) => {
  const skill = await updateSkillService(req.params.id, req.body);
  res.status(200).json({ data: skill });
});

// DELETE /skills/:id - Delete skill (permanent)
export const deleteSkill = asyncHandler(async (req, res) => {
  await deleteSkillService(req.params.id);
  res.status(200).json({ message: "Skill deleted successfully" });
});
