// src/modules/departments/department.controller.js
import asyncHandler from "express-async-handler";
import {
  getDepartmentsService,
  getDepartmentByIdService,
  createDepartmentService,
  updateDepartmentService,
  toggleDepartmentActiveService,
  deleteDepartmentService,
} from "./department.service.js";

// GET /departments - List departments (isActive=true by default)
export const getDepartments = asyncHandler(async (req, res) => {
  const result = await getDepartmentsService(req.query);
  res.status(200).json(result);
});

// GET /departments/:id - Get single department
export const getDepartment = asyncHandler(async (req, res) => {
  const dept = await getDepartmentByIdService(req.params.id);
  res.status(200).json({ data: dept });
});

// POST /departments - Create department
export const createDepartment = asyncHandler(async (req, res) => {
  const dept = await createDepartmentService(req.body);
  res
    .status(201)
    .json({ message: "Department created successfully", data: dept });
});

// PATCH /departments/:id - Update department (name only)
export const updateDepartment = asyncHandler(async (req, res) => {
  const dept = await updateDepartmentService(req.params.id, req.body);
  res.status(200).json({ data: dept });
});

// PATCH /departments/:id/toggle-active - Toggle department active status
export const toggleDepartmentActive = asyncHandler(async (req, res) => {
  const dept = await toggleDepartmentActiveService(req.params.id);
  res.status(200).json({ message: "Department status changed", data: dept });
});

// DELETE /departments/:id - Delete department (permanent)
export const deleteDepartment = asyncHandler(async (req, res) => {
  await deleteDepartmentService(req.params.id);
  res.status(200).json({ message: "Department deleted successfully" });
});
