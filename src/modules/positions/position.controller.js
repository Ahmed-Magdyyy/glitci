// src/modules/positions/position.controller.js
import asyncHandler from "express-async-handler";
import {
  getPositionsService,
  getPositionByIdService,
  createPositionService,
  updatePositionService,
  deletePositionService,
} from "./position.service.js";

// GET /positions - List positions
export const getPositions = asyncHandler(async (req, res) => {
  const result = await getPositionsService(req.query);
  res.status(200).json(result);
});

// GET /positions/:id - Get single position
export const getPosition = asyncHandler(async (req, res) => {
  const position = await getPositionByIdService(req.params.id);
  res.status(200).json({ data: position });
});

// POST /positions - Create position
export const createPosition = asyncHandler(async (req, res) => {
  const position = await createPositionService(req.body);
  res
    .status(201)
    .json({ message: "Position created successfully", data: position });
});

// PATCH /positions/:id - Update position (name, description, department)
export const updatePosition = asyncHandler(async (req, res) => {
  const position = await updatePositionService(req.params.id, req.body);
  res.status(200).json({ data: position });
});

// DELETE /positions/:id - Delete position (permanent)
export const deletePosition = asyncHandler(async (req, res) => {
  await deletePositionService(req.params.id);
  res.status(200).json({ message: "Position deleted successfully" });
});
