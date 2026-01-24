import asyncHandler from "express-async-handler";
import { getOverviewService, getStatsService } from "./analytics.service.js";

export const getOverview = asyncHandler(async (req, res) => {
  // req.userCurrency is set by currencyMiddleware (after auth in routes)
  const result = await getOverviewService(req.query, req.userCurrency);
  res.json({ data: result });
});

export const getStats = asyncHandler(async (req, res) => {
  // req.userCurrency is set by currencyMiddleware (after auth in routes)
  const result = await getStatsService(req.userCurrency);
  res.json({ data: result });
});
