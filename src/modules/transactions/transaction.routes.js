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
import { validatorMiddleware } from "../../shared/middlewares/validatorMiddleware.js";
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
  validatorMiddleware,
  createClientPayment,
);

router.post(
  "/employee-payment",
  allowedTo("admin", "manager"),
  employeePaymentValidator,
  validatorMiddleware,
  createEmployeePayment,
);

router.post(
  "/expense",
  allowedTo("admin", "manager"),
  expenseValidator,
  validatorMiddleware,
  createExpense,
);

// Generic CRUD
router
  .route("/")
  .get(listTransactionsValidator, validatorMiddleware, getTransactions)
  .post(
    allowedTo("admin", "manager"),
    createTransactionValidator,
    validatorMiddleware,
    createTransaction,
  );

router
  .route("/:id")
  .get(transactionIdValidator, validatorMiddleware, getTransaction)
  .patch(
    allowedTo("admin", "manager"),
    updateTransactionValidator,
    validatorMiddleware,
    updateTransaction,
  )
  .delete(
    allowedTo("admin"),
    transactionIdValidator,
    validatorMiddleware,
    deleteTransaction,
  );

export default router;
