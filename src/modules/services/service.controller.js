// src/modules/services/service.controller.js
import asyncHandler from "express-async-handler";
import {
  getServicesService,
  getServiceByIdService,
  createServiceService,
  updateServiceService,
  toggleServiceActiveService,
  deleteServiceService,
} from "./service.service.js";

// GET /services - List services (isActive=true by default)
export const getServices = asyncHandler(async (req, res) => {
  const result = await getServicesService(req.query);
  res.status(200).json(result);
});

// GET /services/:id - Get single service
export const getService = asyncHandler(async (req, res) => {
  const service = await getServiceByIdService(req.params.id);
  res.status(200).json({ data: service });
});

// POST /services - Create service
export const createService = asyncHandler(async (req, res) => {
  const service = await createServiceService(req.body);
  res
    .status(201)
    .json({ message: "Service created successfully", data: service });
});

// PATCH /services/:id - Update service (name, description, department)
export const updateService = asyncHandler(async (req, res) => {
  const service = await updateServiceService(req.params.id, req.body);
  res.status(200).json({ data: service });
});

// PATCH /services/:id/toggle-active - Toggle service active status
export const toggleServiceActive = asyncHandler(async (req, res) => {
  const service = await toggleServiceActiveService(req.params.id);
  res.status(200).json({ message: "Service status changed", data: service });
});

// DELETE /services/:id - Delete service (permanent)
export const deleteService = asyncHandler(async (req, res) => {
  await deleteServiceService(req.params.id);
  res.status(200).json({ message: "Service deleted successfully" });
});
