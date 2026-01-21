// src/modules/positions/position.service.js
import { PositionModel } from "./position.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  buildPagination,
  buildRegexFilter,
} from "../../shared/utils/apiFeatures.js";

// Helper to build position response
export function buildPositionResponse(position) {
  return {
    id: position._id,
    name: position.name,
    description: position.description || null,
    department: position.department
      ? {
          id: position.department._id || position.department,
          name: position.department.name || null,
        }
      : null,
    createdAt: position.createdAt,
    updatedAt: position.updatedAt,
  };
}

// Get all positions with filters
export async function getPositionsService(queryParams) {
  const { page, limit, department, ...query } = queryParams;

  const filter = buildRegexFilter(query, ["page", "limit", "department"]);

  if (department) {
    filter.department = department;
  }

  const totalCount = await PositionModel.countDocuments(filter);

  const { pageNum, limitNum, skip } = buildPagination({ page, limit }, 10);

  const positions = await PositionModel.find(filter)
    .populate("department", "name")
    .skip(skip)
    .limit(limitNum)
    .sort("name");

  const totalPages = Math.ceil(totalCount / limitNum) || 1;

  return {
    totalPages,
    page: pageNum,
    limit: limitNum,
    results: positions.length,
    data: positions.map(buildPositionResponse),
  };
}

// Get single position by ID
export async function getPositionByIdService(id) {
  const position = await PositionModel.findById(id).populate(
    "department",
    "name",
  );

  if (!position) {
    throw new ApiError("Position not found", 404);
  }

  return buildPositionResponse(position);
}

// Create position
export async function createPositionService(payload) {
  const { name, description, department } = payload;

  // Validate department exists
  const departmentExists = await DepartmentModel.findById(department);
  if (!departmentExists) {
    throw new ApiError("Department not found", 400);
  }

  if (!departmentExists.isActive) {
    throw new ApiError(
      `Department ${departmentExists.name} is not active, cannot create position in it`,
      400,
    );
  }

  // Check if position with same name exists for this department
  const existing = await PositionModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    department,
  });

  if (existing) {
    throw new ApiError(
      "Position with this name already exists for this department",
      409,
    );
  }

  const position = await PositionModel.create({
    name: name.toLowerCase(),
    description: description || null,
    department,
  });

  const populatedPosition = await PositionModel.findById(position._id).populate(
    "department",
    "name",
  );

  return buildPositionResponse(populatedPosition);
}

// Update position (name, description, department)
export async function updatePositionService(id, payload) {
  const position = await PositionModel.findById(id);

  if (!position) {
    throw new ApiError("Position not found", 404);
  }

  const { name, description, department } = payload;

  if (department !== undefined) {
    const departmentExists = await DepartmentModel.findById(department);
    if (!departmentExists) {
      throw new ApiError("Department not found", 400);
    }
    position.department = department;
  }

  if (name !== undefined) {
    const existing = await PositionModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      department: department || position.department,
      _id: { $ne: id },
    });

    if (existing) {
      throw new ApiError(
        "Position with this name already exists for this department",
        409,
      );
    }
    position.name = name.toLowerCase();
  }

  if (description !== undefined) {
    position.description = description;
  }

  const updatedPosition = await position.save();
  const populatedPosition = await PositionModel.findById(
    updatedPosition._id,
  ).populate("department", "name");

  return buildPositionResponse(populatedPosition);
}

// Delete position (permanent)
export async function deletePositionService(id) {
  const position = await PositionModel.findById(id);

  if (!position) {
    throw new ApiError("Position not found", 404);
  }

  await position.deleteOne();

  return { id, message: "Position deleted successfully" };
}
