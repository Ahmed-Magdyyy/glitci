import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const DepartmentModel =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);
