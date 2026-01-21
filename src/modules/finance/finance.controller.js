import asyncHandler from "express-async-handler";
import {
  getProjectFinancialsService,
  getProjectEmployeeBreakdownService,
  getClientPaymentHistoryService,
  getCompanyFinancialsService,
} from "./finance.service.js";

export const getProjectFinancials = asyncHandler(async (req, res) => {
  const result = await getProjectFinancialsService(req.params.projectId);
  res.json({ data: result });
});

export const getProjectEmployeeBreakdown = asyncHandler(async (req, res) => {
  const result = await getProjectEmployeeBreakdownService(req.params.projectId);
  res.json({ data: result });
});

export const getClientPaymentHistory = asyncHandler(async (req, res) => {
  const result = await getClientPaymentHistoryService(req.params.projectId);
  res.json({ data: result });
});

export const getCompanyFinancials = asyncHandler(async (req, res) => {
  const result = await getCompanyFinancialsService(req.query);
  res.json({ data: result });
});
