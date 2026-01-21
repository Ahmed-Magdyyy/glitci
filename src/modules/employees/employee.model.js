import mongoose from "mongoose";
import { EMPLOYMENT_TYPE } from "../../shared/constants/employee.enums.js";

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPE),
      default: EMPLOYMENT_TYPE.FREELANCER,
    },
  },
  { timestamps: true },
);

employeeSchema.index({ department: 1 });
employeeSchema.index({ position: 1 });
employeeSchema.index({ skills: 1 });

export const EmployeeModel =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
