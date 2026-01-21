// src/modules/services/service.service.js
import { ServiceModel } from "./service.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  buildPagination,
  buildRegexFilter,
} from "../../shared/utils/apiFeatures.js";

// Helper to build service response
export function buildServiceResponse(service) {
  return {
    id: service._id,
    name: service.name,
    description: service.description || null,
    department: service.department
      ? {
          id: service.department._id || service.department,
          name: service.department.name || null,
        }
      : null,
    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

// Get all services with filters
export async function getServicesService(queryParams) {
  const { page, limit, isActive, department, ...query } = queryParams;

  const filter = buildRegexFilter(query, [
    "page",
    "limit",
    "isActive",
    "department",
  ]);

  // Filter by department if provided
  if (department) {
    filter.department = department;
  }

  // Default isActive to true unless explicitly set
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  } else {
    filter.isActive = true;
  }

  const totalCount = await ServiceModel.countDocuments(filter);

  const { pageNum, limitNum, skip } = buildPagination({ page, limit }, 10);

  const services = await ServiceModel.find(filter)
    .populate("department", "name")
    .skip(skip)
    .limit(limitNum)
    .sort("name");

  const totalPages = Math.ceil(totalCount / limitNum) || 1;

  return {
    totalPages,
    page: pageNum,
    limit: limitNum,
    results: services.length,
    data: services.map(buildServiceResponse),
  };
}

// Get single service by ID
export async function getServiceByIdService(id) {
  const service = await ServiceModel.findById(id).populate(
    "department",
    "name",
  );

  if (!service) {
    throw new ApiError("Service not found", 404);
  }

  return buildServiceResponse(service);
}

// Create service
export async function createServiceService(payload) {
  const { name, description, department } = payload;

  // Validate department exists
  const departmentExists = await DepartmentModel.findById(department);
  if (!departmentExists) {
    throw new ApiError("Department not found", 400);
  }

  // Check if department is active
  if (!departmentExists.isActive) {
    throw new ApiError(
      `Department ${departmentExists.name} is not active, cannot create service in it`,
      400,
    );
  }

  // Check if service with same name exists for this department
  const existing = await ServiceModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    department,
  });

  if (existing) {
    throw new ApiError(
      "Service with this name already exists for this department",
      409,
    );
  }

  const service = await ServiceModel.create({
    name,
    description: description || null,
    department,
    isActive: true,
  });

  const populatedService = await ServiceModel.findById(service._id).populate(
    "department",
    "name",
  );

  return buildServiceResponse(populatedService);
}

// Update service (name, description, department)
export async function updateServiceService(id, payload) {
  const service = await ServiceModel.findById(id);

  if (!service) {
    throw new ApiError("Service not found", 404);
  }

  const { name, description, department } = payload;

  if (department !== undefined) {
    const departmentExists = await DepartmentModel.findById(department);
    if (!departmentExists) {
      throw new ApiError("Department not found", 400);
    }
    service.department = department;
  }

  // If name is being updated, check for duplicates
  if (name !== undefined) {
    const existing = await ServiceModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      department: department || service.department,
      _id: { $ne: id },
    });

    if (existing) {
      throw new ApiError(
        "Service with this name already exists for this department",
        409,
      );
    }
    service.name = name;
  }

  if (description !== undefined) {
    service.description = description;
  }

  const updatedService = await service.save();
  const populatedService = await ServiceModel.findById(
    updatedService._id,
  ).populate("department", "name");

  return buildServiceResponse(populatedService);
}

// Toggle service active status
export async function toggleServiceActiveService(id) {
  const service = await ServiceModel.findById(id);

  if (!service) {
    throw new ApiError("Service not found", 404);
  }

  service.isActive = !service.isActive;
  const updatedService = await service.save();
  const populatedService = await ServiceModel.findById(
    updatedService._id,
  ).populate("department", "name");

  return buildServiceResponse(populatedService);
}

// Delete service (permanent)
export async function deleteServiceService(id) {
  const service = await ServiceModel.findById(id);

  if (!service) {
    throw new ApiError("Service not found", 404);
  }

  await service.deleteOne();

  return { id, message: "Service deleted successfully" };
}
