import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
  createClientPayment,
  createEmployeePayment,
  createExpense,
} from "./transaction.controller.js";
import { protect, allowedTo } from "../auth/auth.middleware.js";
import {
  createTransactionValidator,
  updateTransactionValidator,
  transactionIdValidator,
  listTransactionsValidator,
  clientPaymentValidator,
  employeePaymentValidator,
  expenseValidator,
} from "./transaction.validator.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Shorthand endpoints (for convenience)
router.post(
  "/client-payment",
  allowedTo("admin", "manager"),
  clientPaymentValidator,
  createClientPayment,
);

router.post(
  "/employee-payment",
  allowedTo("admin", "manager"),
  employeePaymentValidator,
  createEmployeePayment,
);

router.post(
  "/expense",
  allowedTo("admin", "manager"),
  expenseValidator,
  createExpense,
);

// Generic CRUD
router
  .route("/")
  .get(listTransactionsValidator, getTransactions)
  .post(
    allowedTo("admin", "manager"),
    createTransactionValidator,
    createTransaction,
  );

router
  .route("/:id")
  .get(transactionIdValidator, getTransaction)
  .patch(
    allowedTo("admin", "manager"),
    updateTransactionValidator,
    updateTransaction,
  )
  .delete(allowedTo("admin"), transactionIdValidator, deleteTransaction);

export default router;
