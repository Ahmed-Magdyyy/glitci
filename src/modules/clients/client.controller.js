// src/modules/clients/client.controller.js
import asyncHandler from "express-async-handler";
import {
  getClientsService,
  getClientByIdService,
  createClientService,
  updateClientService,
  toggleClientActiveService,
  deleteClientService,
} from "./client.service.js";

// GET /clients - List clients (isActive=true by default)
export const getClients = asyncHandler(async (req, res) => {
  const result = await getClientsService(req.query);
  res.status(200).json(result);
});

// GET /clients/:id - Get single client
export const getClient = asyncHandler(async (req, res) => {
  const client = await getClientByIdService(req.params.id);
  res.status(200).json({ data: client });
});

// POST /clients - Create client
export const createClient = asyncHandler(async (req, res) => {
  const client = await createClientService(req.body);
  res
    .status(201)
    .json({ message: "Client created successfully", data: client });
});

// PATCH /clients/:id - Update client (all fields except isActive)
export const updateClient = asyncHandler(async (req, res) => {
  const client = await updateClientService(req.params.id, req.body);
  res.status(200).json({ data: client });
});

// PATCH /clients/:id/toggle-active - Toggle client active status
export const toggleClientActive = asyncHandler(async (req, res) => {
  const client = await toggleClientActiveService(req.params.id);
  res.status(200).json({ message: "Client status changed", data: client });
});

// DELETE /clients/:id - Delete client (permanent)
export const deleteClient = asyncHandler(async (req, res) => {
  await deleteClientService(req.params.id);
  res.status(200).json({ message: "Client deleted successfully" });
});
