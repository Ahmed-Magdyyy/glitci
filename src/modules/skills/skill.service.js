// src/modules/skills/skill.service.js
import { SkillModel } from "./skill.model.js";
import { PositionModel } from "../positions/position.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  buildPagination,
  buildRegexFilter,
} from "../../shared/utils/apiFeatures.js";

// Helper to build skill response
export function buildSkillResponse(skill) {
  return {
    id: skill._id,
    name: skill.name,
    position: skill.position
      ? {
          id: skill.position._id || skill.position,
          name: skill.position.name || null,
        }
      : null,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

// Get all skills with filters
export async function getSkillsService(queryParams) {
  const { page, limit, position, ...query } = queryParams;

  const filter = buildRegexFilter(query, ["page", "limit", "position"]);

  if (position) {
    filter.position = position;
  }

  const totalCount = await SkillModel.countDocuments(filter);

  const { pageNum, limitNum, skip } = buildPagination({ page, limit }, 10);

  const skills = await SkillModel.find(filter)
    .populate("position", "name")
    .skip(skip)
    .limit(limitNum)
    .sort("name");

  const totalPages = Math.ceil(totalCount / limitNum) || 1;

  return {
    totalPages,
    page: pageNum,
    limit: limitNum,
    results: skills.length,
    data: skills.map(buildSkillResponse),
  };
}

// Get single skill by ID
export async function getSkillByIdService(id) {
  const skill = await SkillModel.findById(id).populate("position", "name");

  if (!skill) {
    throw new ApiError("Skill not found", 404);
  }

  return buildSkillResponse(skill);
}

// Create skill(s)
export async function createSkillService(payload) {
  const { position, name } = payload;

  // Normalize skill names to array
  const skillNames = Array.isArray(name) ? name : [name];

  // Validate position exists
  const positionExists = await PositionModel.findById(position);
  if (!positionExists) {
    throw new ApiError("Position not found", 400);
  }

  const createdSkills = [];

  for (const skillName of skillNames) {
    // Check if skill with same name exists for this position
    const existing = await SkillModel.findOne({
      name: { $regex: new RegExp(`^${skillName}$`, "i") },
      position,
    });

    if (existing) {
      throw new ApiError(
        `Skill ${skillName} already exists for position ${positionExists.name}`,
        409,
      );
    }

    const skill = await SkillModel.create({
      name: skillName,
      position,
    });

    const populatedSkill = await SkillModel.findById(skill._id).populate(
      "position",
      "name",
    );

    createdSkills.push(buildSkillResponse(populatedSkill));
  }

  return createdSkills.length === 1 ? createdSkills[0] : createdSkills;
}

// Update skill (name, position)
export async function updateSkillService(id, payload) {
  const skill = await SkillModel.findById(id);

  if (!skill) {
    throw new ApiError("Skill not found", 404);
  }

  const { name, position } = payload;

  if (position !== undefined) {
    const positionExists = await PositionModel.findById(position);
    if (!positionExists) {
      throw new ApiError("Position not found", 400);
    }
    skill.position = position;
  }

  if (name !== undefined) {
    const existing = await SkillModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      position: position || skill.position,
      _id: { $ne: id },
    });

    if (existing) {
      throw new ApiError(
        "Skill with this name already exists for this position",
        409,
      );
    }
    skill.name = name;
  }

  const updatedSkill = await skill.save();
  const populatedSkill = await SkillModel.findById(updatedSkill._id).populate(
    "position",
    "name",
  );

  return buildSkillResponse(populatedSkill);
}

// Delete skill (permanent)
export async function deleteSkillService(id) {
  const skill = await SkillModel.findById(id);

  if (!skill) {
    throw new ApiError("Skill not found", 404);
  }

  await skill.deleteOne();

  return { id, message: "Skill deleted successfully" };
}
