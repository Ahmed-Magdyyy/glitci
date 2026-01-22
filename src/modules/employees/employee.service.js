import crypto from "crypto";
import mongoose from "mongoose";
import { EmployeeModel } from "./employee.model.js";
import { UserModel } from "../users/user.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { PositionModel } from "../positions/position.model.js";
import { SkillModel } from "../skills/skill.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  buildPagination,
  buildRegexFilter,
  buildSort,
  normalizeEnum,
} from "../../shared/utils/apiFeatures.js";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";
import { EMPLOYMENT_TYPE } from "../../shared/constants/employee.enums.js";
import sendEmail from "../../shared/Email/sendEmails.js";
import { accountCreatedEmailHTML } from "../../shared/Email/emailHtml.js";

// Helper to build employee response
export function buildEmployeeResponse(employee) {
  const user = employee.user || {};
  return {
    id: employee._id,
    user: {
      id: user._id || user,
      name: user.name || null,
      email: user.email || null,
      image: user.image?.url || null,
      phone: user.phone || null,
      isActive: user.isActive,
    },
    employmentType: employee.employmentType || null,
    department: employee.department
      ? {
          id: employee.department._id || employee.department,
          name: employee.department.name || null,
        }
      : null,
    position: employee.position
      ? {
          id: employee.position._id || employee.position,
          name: employee.position.name || null,
        }
      : null,
    skills: employee.skills
      ? employee.skills.map((skill) => ({
          id: skill._id || skill,
          name: skill.name || null,
        }))
      : [],
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

// Populate options
const populateOptions = [
  { path: "user", select: "name email phone isActive image.url" },
  { path: "department", select: "name" },
  { path: "position", select: "name" },
  { path: "skills", select: "name" },
];

// Get all employees with filters
export async function getEmployeesService(queryParams) {
  const {
    page,
    limit,
    isActive,
    department,
    position,
    skill,
    employmentType,
    ...query
  } = queryParams;

  const filter = {};

  if (department) filter.department = department;
  if (position) filter.position = position;
  if (skill) filter.skills = skill;

  // Normalize employmentType (case-insensitive)
  const normalizedEmploymentType = normalizeEnum(
    employmentType,
    EMPLOYMENT_TYPE,
  );
  if (normalizedEmploymentType)
    filter.employmentType = normalizedEmploymentType;

  // Build regex filter for name/email search on populated user
  const userFilter = {};
  if (query.name) {
    userFilter["user.name"] = { $regex: query.name, $options: "i" };
  }

  // First get employees, then filter by user.isActive
  let employees = await EmployeeModel.find(filter)
    .populate(populateOptions)
    .sort("createdAt");

  // Filter by user.isActive
  if (isActive !== undefined) {
    const activeValue = isActive === "true" || isActive === true;
    employees = employees.filter(
      (emp) => emp.user && emp.user.isActive === activeValue,
    );
  } else {
    // Default: only active
    employees = employees.filter(
      (emp) => emp.user && emp.user.isActive === true,
    );
  }

  // Filter by name search
  if (query.name) {
    const nameRegex = new RegExp(query.name, "i");
    employees = employees.filter(
      (emp) => emp.user && nameRegex.test(emp.user.name),
    );
  }

  const totalCount = employees.length;
  const { pageNum, limitNum, skip } = buildPagination({ page, limit }, 10);

  // Paginate in memory
  const paginatedEmployees = employees.slice(skip, skip + limitNum);

  const totalPages = Math.ceil(totalCount / limitNum) || 1;

  return {
    totalPages,
    page: pageNum,
    limit: limitNum,
    results: paginatedEmployees.length,
    data: paginatedEmployees.map(buildEmployeeResponse),
  };
}

// Get single employee by ID
export async function getEmployeeByIdService(id) {
  const employee = await EmployeeModel.findById(id).populate(populateOptions);

  if (!employee) {
    throw new ApiError("Employee not found", 404);
  }

  return buildEmployeeResponse(employee);
}

// Create employee (creates User + Employee in transaction)
export async function createEmployeeService(payload) {
  const { name, email, phone, department, position, skills, employmentType } =
    payload;

  // Normalize employmentType (case-insensitive)
  const normalizedEmploymentType =
    normalizeEnum(employmentType, EMPLOYMENT_TYPE) ||
    EMPLOYMENT_TYPE.FREELANCER;

  // Validate department exists and is active
  const departmentExists = await DepartmentModel.findById(department);
  if (!departmentExists) {
    throw new ApiError("Department not found", 400);
  }
  if (!departmentExists.isActive) {
    throw new ApiError(
      `Department ${departmentExists.name} is not active`,
      400,
    );
  }

  // Validate position exists and belongs to department
  const positionExists = await PositionModel.findOne({
    _id: position,
    department,
  });
  if (!positionExists) {
    throw new ApiError(
      "Position not found or does not belong to this department",
      400,
    );
  }

  // Validate skills exist and belong to position (if provided)
  if (skills && skills.length > 0) {
    const validSkillsCount = await SkillModel.countDocuments({
      _id: { $in: skills },
      position,
    });

    if (validSkillsCount !== skills.length) {
      throw new ApiError(
        "One or more skills do not belong to this position",
        400,
      );
    }
  }

  // Check for duplicate email
  const existingEmail = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError("User with this email already exists", 409);
  }

  // Generate 12-char temporary password
  const tempPassword = crypto.randomBytes(6).toString("hex");

  // Start transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Create User with role EMPLOYEE
    const [user] = await UserModel.create(
      [
        {
          name,
          email: email.toLowerCase(),
          password: null,
          tempPassword,
          phone: phone || null,
          role: USER_ROLES.EMPLOYEE,
          isActive: true,
        },
      ],
      { session },
    );

    // 2. Create Employee linked to User
    const [employee] = await EmployeeModel.create(
      [
        {
          user: user._id,
          department,
          position,
          skills: skills || [],
          employmentType: normalizedEmploymentType,
        },
      ],
      { session },
    );

    const firstName = (user.name || "").split(" ")[0] || "there";
    const capitalizedName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    // Send welcome email with credentials (blocking - rollback if fails)
    await sendEmail({
      email: user.email,
      subject: "Welcome to Glitci - Your Account Credentials",
      message: accountCreatedEmailHTML(
        capitalizedName,
        user.email,
        tempPassword,
      ),
    });

    // Commit transaction
    await session.commitTransaction();

    // Return just the ID (no expensive populate)
    return { id: employee._id };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// Update employee (user fields + employee profile) - Admin only
export async function updateEmployeeService(id, payload) {
  const employee = await EmployeeModel.findById(id).populate("user");

  if (!employee) {
    throw new ApiError("Employee not found", 404);
  }

  if (!employee.user) {
    throw new ApiError("Employee has no linked user account", 400);
  }

  const { name, email, phone, department, position, skills, employmentType } =
    payload;
  const newDepartment = department || employee.department;
  const newPosition = position || employee.position;

  // Normalize employmentType (case-insensitive)
  const normalizedEmploymentType = employmentType
    ? normalizeEnum(employmentType, EMPLOYMENT_TYPE)
    : undefined;

  // --- Run all validations in parallel ---
  const [existingEmail, departmentDoc, positionDoc, validSkillsCount] =
    await Promise.all([
      // Check email uniqueness (only if email is changing)
      email
        ? UserModel.findOne({
            email: email.toLowerCase(),
            _id: { $ne: employee.user._id },
          })
        : null,
      // Validate department (only if changing)
      department ? DepartmentModel.findById(department) : null,
      // Validate position belongs to department (only if either is changing)
      position !== undefined || department !== undefined
        ? PositionModel.findOne({ _id: newPosition, department: newDepartment })
        : { exists: true },
      // Validate skills belong to position (only if changing)
      skills && skills.length > 0
        ? SkillModel.countDocuments({
            _id: { $in: skills },
            position: newPosition,
          })
        : 0,
    ]);

  // --- Validate results ---
  if (email && existingEmail) {
    throw new ApiError("User with this email already exists", 409);
  }

  if (department !== undefined) {
    if (!departmentDoc) {
      throw new ApiError("Department not found", 400);
    }
    if (!departmentDoc.isActive) {
      throw new ApiError(`Department ${departmentDoc.name} is not active`, 400);
    }
  }

  if ((position !== undefined || department !== undefined) && !positionDoc) {
    throw new ApiError(
      "Position not found or does not belong to this department",
      400,
    );
  }

  if (skills && skills.length > 0 && validSkillsCount !== skills.length) {
    throw new ApiError(
      "One or more skills do not belong to this position",
      400,
    );
  }

  // --- Apply updates ---
  // User fields
  if (name !== undefined) employee.user.name = name;
  if (phone !== undefined) employee.user.phone = phone;
  if (email !== undefined) employee.user.email = email.toLowerCase();

  // Employee profile fields
  if (department !== undefined) employee.department = department;
  if (position !== undefined) employee.position = position;
  if (skills !== undefined) employee.skills = skills;
  if (normalizedEmploymentType !== undefined)
    employee.employmentType = normalizedEmploymentType;

  // --- Save in parallel ---
  const hasUserChanges =
    name !== undefined || email !== undefined || phone !== undefined;
  await Promise.all([
    hasUserChanges ? employee.user.save() : null,
    employee.save(),
  ]);

  // No return needed - controller just returns success message
}

// Toggle employee active status (toggles the linked User's isActive)
export async function toggleEmployeeActiveService(id) {
  const employee = await EmployeeModel.findById(id).populate("user");

  if (!employee) {
    throw new ApiError("Employee not found", 404);
  }

  if (!employee.user) {
    throw new ApiError("Employee has no linked user account", 400);
  }

  // Toggle user's isActive
  employee.user.isActive = !employee.user.isActive;
  await employee.user.save();

  // Return just the new status
  return { isActive: employee.user.isActive };
}

// Delete employee (deletes both Employee and User in transaction)
export async function deleteEmployeeService(id) {
  const employee = await EmployeeModel.findById(id);

  if (!employee) {
    throw new ApiError("Employee not found", 404);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Delete user account
    await UserModel.findByIdAndDelete(employee.user, { session });

    // Delete employee profile
    await EmployeeModel.findByIdAndDelete(id, { session });

    await session.commitTransaction();

    return { id, message: "Employee deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
