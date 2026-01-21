import mongoose from "mongoose";
import { ProjectModel } from "../projects/project.model.js";
import { ProjectMemberModel } from "../projects/projectMember.model.js";
import { TransactionModel } from "../transactions/transaction.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  TRANSACTION_TYPE,
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
} from "../../shared/constants/transaction.enums.js";

const { ObjectId } = mongoose.Types;

// ================== PROJECT FINANCIALS ==================

export async function getProjectFinancialsService(projectId) {
  const project = await ProjectModel.findById(projectId)
    .populate("client", "name companyName")
    .lean();

  if (!project || !project.isActive) {
    throw new ApiError("Project not found", 404);
  }

  const [
    memberAgg,
    transactionAgg,
    employeePayments,
    clientTransactions,
    employeeTransactions,
  ] = await Promise.all([
    // Total compensation agreed for all members
    ProjectMemberModel.aggregate([
      {
        $match: {
          project: new ObjectId(projectId),
          removedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalCompensation: { $sum: "$compensation" },
          memberCount: { $sum: 1 },
        },
      },
    ]),

    // Sum transactions by type
    TransactionModel.aggregate([
      {
        $match: {
          project: new ObjectId(projectId),
          status: TRANSACTION_STATUS.COMPLETED,
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // Employee-specific payments
    TransactionModel.aggregate([
      {
        $match: {
          project: new ObjectId(projectId),
          status: TRANSACTION_STATUS.COMPLETED,
          category: {
            $in: [
              TRANSACTION_CATEGORY.EMPLOYEE_SALARY,
              TRANSACTION_CATEGORY.EMPLOYEE_BONUS,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$amount" },
        },
      },
    ]),

    // Client transactions (income) - full details
    TransactionModel.find({
      project: projectId,
      type: TRANSACTION_TYPE.INCOME,
      status: TRANSACTION_STATUS.COMPLETED,
    })
      .populate("client", "name companyName")
      .populate("addedBy", "name email")
      .sort({ date: -1 })
      .lean(),

    // Employee transactions - full details
    TransactionModel.find({
      project: projectId,
      category: {
        $in: [
          TRANSACTION_CATEGORY.EMPLOYEE_SALARY,
          TRANSACTION_CATEGORY.EMPLOYEE_BONUS,
        ],
      },
      status: TRANSACTION_STATUS.COMPLETED,
    })
      .populate("employee", "user")
      .populate({
        path: "employee",
        populate: { path: "user", select: "name email" },
      })
      .populate("addedBy", "name email")
      .sort({ date: -1 })
      .lean(),
  ]);

  const totalCompensation = memberAgg[0]?.totalCompensation || 0;
  const memberCount = memberAgg[0]?.memberCount || 0;
  const income =
    transactionAgg.find((t) => t._id === TRANSACTION_TYPE.INCOME)?.total || 0;
  const totalExpenses =
    transactionAgg.find((t) => t._id === TRANSACTION_TYPE.EXPENSE)?.total || 0;
  const totalPaidToEmployees = employeePayments[0]?.totalPaid || 0;
  const otherExpenses = totalExpenses - totalPaidToEmployees;

  // Format transaction breakdowns
  const formattedClientTransactions = clientTransactions.map((t) => ({
    id: t._id,
    amount: t.amount,
    date: t.date,
    description: t.description,
    category: t.category,
    paymentMethod: t.paymentMethod,
    reference: t.reference,
    client: {
      id: t.client?._id,
      name: t.client?.name || t.client?.companyName,
    },
    addedBy: t.addedBy?.name,
  }));

  const formattedEmployeeTransactions = employeeTransactions.map((t) => ({
    id: t._id,
    amount: t.amount,
    date: t.date,
    description: t.description,
    category: t.category,
    paymentMethod: t.paymentMethod,
    employee: {
      id: t.employee?._id,
      name: t.employee?.user?.name,
      email: t.employee?.user?.email,
    },
    addedBy: t.addedBy?.name,
  }));

  return {
    project: {
      _id: project._id,
      name: project.name,
      budget: project.budget,
      client: project.client,
      status: project.status,
    },
    financials: {
      budget: project.budget,
      totalEmployeesCompensation: totalCompensation,
      employeesCount: memberCount,

      // Actual money movement
      moneyCollected: income,
      totalExpenses,
      paidToEmployees: totalPaidToEmployees,
      otherExpenses,

      // Calculated balances
      clientBalanceDue: project.budget - income,
      employeeBalanceDue: totalCompensation - totalPaidToEmployees,

      // Profit calculations
      grossProfit: project.budget - totalCompensation - otherExpenses,
      netProfitToDate: income - totalExpenses,
    },
    transactions: {
      clientTransactions: formattedClientTransactions,
      employeeTransactions: formattedEmployeeTransactions,
    },
  };
}

// ================== EMPLOYEE BREAKDOWN ==================

export async function getProjectEmployeeBreakdownService(projectId) {
  const project = await ProjectModel.findById(projectId);
  if (!project || !project.isActive) {
    throw new ApiError("Project not found", 404);
  }

  // Get all active members
  const members = await ProjectMemberModel.find({
    project: projectId,
    removedAt: null,
  })
    .populate({
      path: "employee",
      populate: [
        { path: "user", select: "name email" },
        { path: "position", select: "name" },
      ],
    })
    .lean();

  // Get payments per employee
  const employeePayments = await TransactionModel.aggregate([
    {
      $match: {
        project: new ObjectId(projectId),
        status: TRANSACTION_STATUS.COMPLETED,
        category: {
          $in: [
            TRANSACTION_CATEGORY.EMPLOYEE_SALARY,
            TRANSACTION_CATEGORY.EMPLOYEE_BONUS,
          ],
        },
        employee: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$employee",
        totalPaid: { $sum: "$amount" },
        paymentCount: { $sum: 1 },
      },
    },
  ]);

  // Build breakdown
  const breakdown = members.map((member) => {
    const payment = employeePayments.find(
      (p) => p._id.toString() === member.employee._id.toString(),
    );
    const paid = payment?.totalPaid || 0;

    return {
      employee: {
        id: member.employee._id,
        name: member.employee.user?.name || "Unknown",
        email: member.employee.user?.email,
        position: member.employee.position?.name,
      },
      compensation: member.compensation,
      paid,
      remaining: member.compensation - paid,
      paymentCount: payment?.paymentCount || 0,
    };
  });

  return {
    projectId,
    projectName: project.name,
    breakdown,
    summary: {
      employeesCount: breakdown.length,
      totalCompensation: breakdown.reduce((sum, b) => sum + b.compensation, 0),
      totalPaid: breakdown.reduce((sum, b) => sum + b.paid, 0),
      totalRemaining: breakdown.reduce((sum, b) => sum + b.remaining, 0),
    },
  };
}

// ================== CLIENT PAYMENT HISTORY ==================

export async function getClientPaymentHistoryService(projectId) {
  const project = await ProjectModel.findById(projectId)
    .populate("client", "name companyName")
    .lean();

  if (!project || !project.isActive) {
    throw new ApiError("Project not found", 404);
  }

  const payments = await TransactionModel.find({
    project: projectId,
    type: TRANSACTION_TYPE.INCOME,
    category: TRANSACTION_CATEGORY.CLIENT_PAYMENT,
  })
    .sort({ date: -1 })
    .populate("addedBy", "name")
    .lean();

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    project: {
      _id: project._id,
      name: project.name,
      budget: project.budget,
      client: project.client,
    },
    payments,
    summary: {
      totalPayments: payments.length,
      totalCollected,
      balanceDue: project.budget - totalCollected,
      percentagePaid: Math.round((totalCollected / project.budget) * 100),
    },
  };
}

// ================== COMPANY-WIDE FINANCIALS ==================

export async function getCompanyFinancialsService(query = {}) {
  const { startDate, endDate } = query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = { status: TRANSACTION_STATUS.COMPLETED };
  if (Object.keys(dateFilter).length > 0) {
    matchStage.date = dateFilter;
  }

  const [transactionSummary, projectCount, activeProjects] = await Promise.all([
    TransactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    ProjectModel.countDocuments({ isActive: true }),
    ProjectModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$budget" },
        },
      },
    ]),
  ]);

  const income =
    transactionSummary.find((t) => t._id === TRANSACTION_TYPE.INCOME)?.total ||
    0;
  const expenses =
    transactionSummary.find((t) => t._id === TRANSACTION_TYPE.EXPENSE)?.total ||
    0;
  const totalBudget = activeProjects[0]?.totalBudget || 0;

  return {
    period: {
      startDate: startDate || "All time",
      endDate: endDate || "Present",
    },
    summary: {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      profitMargin:
        income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
    },
    projects: {
      activeCount: projectCount,
      totalBudget,
      uncollected: totalBudget - income,
    },
    transactionCounts: {
      income:
        transactionSummary.find((t) => t._id === TRANSACTION_TYPE.INCOME)
          ?.count || 0,
      expense:
        transactionSummary.find((t) => t._id === TRANSACTION_TYPE.EXPENSE)
          ?.count || 0,
    },
  };
}
