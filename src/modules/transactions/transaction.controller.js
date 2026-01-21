import asyncHandler from "express-async-handler";
import {
  createTransactionService,
  deleteTransactionService,
  getTransactionByIdService,
  getTransactionsService,
  updateTransactionService,
  createClientPaymentService,
  createEmployeePaymentService,
  createExpenseService,
} from "./transaction.service.js";

// ================== TRANSACTION CRUD ==================

export const createTransaction = asyncHandler(async (req, res) => {
  const result = await createTransactionService(req.body, req.user._id);
  res.status(201).json(result);
});

export const getTransactions = asyncHandler(async (req, res) => {
  const result = await getTransactionsService(req.query);
  res.json(result);
});

export const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await getTransactionByIdService(req.params.id);
  res.json({ data: transaction });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const result = await updateTransactionService(req.params.id, req.body);
  res.json(result);
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const result = await deleteTransactionService(req.params.id);
  res.json(result);
});

// ================== SHORTHAND ENDPOINTS ==================

export const createClientPayment = asyncHandler(async (req, res) => {
  const result = await createClientPaymentService(req.body, req.user._id);
  res.status(201).json(result);
});

export const createEmployeePayment = asyncHandler(async (req, res) => {
  const result = await createEmployeePaymentService(req.body, req.user._id);
  res.status(201).json(result);
});

export const createExpense = asyncHandler(async (req, res) => {
  const result = await createExpenseService(req.body, req.user._id);
  res.status(201).json(result);
});
