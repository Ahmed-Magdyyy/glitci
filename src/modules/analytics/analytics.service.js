import mongoose from "mongoose";
import { ProjectModel } from "../projects/project.model.js";
import { ProjectMemberModel } from "../projects/projectMember.model.js";
import { TransactionModel } from "../transactions/transaction.model.js";
import { EmployeeModel } from "../employees/employee.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import {
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
} from "../../shared/constants/transaction.enums.js";

const { ObjectId } = mongoose.Types;

/**
 * Get default date range (start of month to today)
 */
function getDefaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  return { from, to };
}

/**
 * Parse date range from query or use defaults
 */
function parseDateRange(query) {
  const defaults = getDefaultDateRange();

  const from = query.from ? new Date(query.from) : defaults.from;
  const to = query.to ? new Date(query.to) : defaults.to;

  // Set to end of day for 'to' date
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

// ================== OVERVIEW (TIME-BASED DATA) ==================

export async function getOverviewService(query = {}) {
  const { from, to } = parseDateRange(query);

  const dateFilter = { $gte: from, $lte: to };

  const [
    transactionSummary,
    incomeByDepartment,
    monthlyGrowth,
    recentProjects,
  ] = await Promise.all([
    // Financial summary for the period
    TransactionModel.aggregate([
      {
        $match: {
          date: dateFilter,
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

    // Income by department (via project department)
    TransactionModel.aggregate([
      {
        $match: {
          date: dateFilter,
          type: TRANSACTION_TYPE.INCOME,
          status: TRANSACTION_STATUS.COMPLETED,
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectData",
        },
      },
      { $unwind: { path: "$projectData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "departments",
          localField: "projectData.department",
          foreignField: "_id",
          as: "departmentData",
        },
      },
      {
        $unwind: { path: "$departmentData", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: {
            department: "$departmentData.name",
            quarter: { $ceil: { $divide: [{ $month: "$date" }, 3] } },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.quarter": 1, "_id.department": 1 } },
    ]),

    // Monthly growth (for chart)
    TransactionModel.aggregate([
      {
        $match: {
          type: TRANSACTION_TYPE.INCOME,
          status: TRANSACTION_STATUS.COMPLETED,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // Recent projects
    ProjectModel.find({ isActive: true })
      .select("name status startDate endDate")
      .populate("client", "name companyName")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // Parse transaction totals
  const totalIncome =
    transactionSummary.find((t) => t._id === TRANSACTION_TYPE.INCOME)?.total ||
    0;
  const totalExpenses =
    transactionSummary.find((t) => t._id === TRANSACTION_TYPE.EXPENSE)?.total ||
    0;

  // Format income by department for chart
  const quarterlyByDept = {};
  incomeByDepartment.forEach((item) => {
    const deptName = item._id.department || "Unassigned";
    const quarter = `Q${item._id.quarter}`;
    if (!quarterlyByDept[quarter]) quarterlyByDept[quarter] = { quarter };
    quarterlyByDept[quarter][deptName] = item.total;
  });

  // Format growth data for chart
  const growthTrend = monthlyGrowth.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    value: item.total,
  }));

  // Format recent projects
  const formattedProjects = recentProjects.map((p) => ({
    id: p._id,
    name: p.name,
    client: p.client?.name || p.client?.companyName || null,
    department: p.department?.name || null,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
  }));

  return {
    period: { from, to },
    financials: {
      totalRevenue: totalIncome,
      totalEarning: totalIncome,
      totalSpending: totalExpenses,
      netProfit: totalIncome - totalExpenses,
    },
    charts: {
      growthTrend,
      incomeByDepartment: Object.values(quarterlyByDept),
    },
    recentProjects: formattedProjects,
  };
}

// ================== STATS (STATIC COUNTS - NO TIME FILTER) ==================

export async function getStatsService() {
  const [
    activeProjects,
    totalProjects,
    activeEmployees,
    departmentStats,
    avgCompletion,
  ] = await Promise.all([
    ProjectModel.countDocuments({ isActive: true }),
    ProjectModel.countDocuments({}),

    // Active employees (users with isActive = true)
    EmployeeModel.countDocuments({}).then(async (count) => {
      const employees = await EmployeeModel.find({})
        .populate("user", "isActive")
        .lean();
      return employees.filter((e) => e.user?.isActive).length;
    }),

    // Department expenses (all-time)
    TransactionModel.aggregate([
      {
        $match: {
          type: TRANSACTION_TYPE.EXPENSE,
          status: TRANSACTION_STATUS.COMPLETED,
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectData",
        },
      },
      { $unwind: { path: "$projectData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "departments",
          localField: "projectData.department",
          foreignField: "_id",
          as: "departmentData",
        },
      },
      {
        $unwind: { path: "$departmentData", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$departmentData._id",
          name: { $first: "$departmentData.name" },
          spent: { $sum: "$amount" },
        },
      },
    ]),

    // Average completion (based on project status)
    ProjectModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  // Get department budgets
  const departments = await DepartmentModel.find({ isActive: true }).lean();
  const departmentBudgets = {};

  // For now, estimate budget as sum of project budgets per department
  const projectsByDept = await ProjectModel.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$department",
        totalBudget: { $sum: "$budget" },
      },
    },
  ]);

  projectsByDept.forEach((p) => {
    if (p._id) departmentBudgets[p._id.toString()] = p.totalBudget;
  });

  // Format department progress
  const departmentProgress = departmentStats
    .filter((d) => d._id)
    .map((d) => {
      const budget = departmentBudgets[d._id.toString()] || 0;
      return {
        id: d._id,
        name: d.name || "Unknown",
        spent: d.spent,
        budget,
        percent: budget > 0 ? Math.round((d.spent / budget) * 100) : 0,
      };
    });

  // Calculate average completion percentage
  const completionData = avgCompletion[0];
  const avgCompletionPercent =
    completionData?.total > 0
      ? Math.round((completionData.completed / completionData.total) * 100)
      : 0;

  return {
    counts: {
      totalProjects,
      activeProjects,
      activeEmployees,
      avgCompletion: avgCompletionPercent,
    },
    departments: departmentProgress,
  };
}
