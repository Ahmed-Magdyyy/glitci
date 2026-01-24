import mongoose from "mongoose";
import {
  CURRENCY_VALUES,
  DEFAULT_CURRENCY,
} from "../../shared/constants/currency.enums.js";

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    compensation: {
      type: Number,
      required: [true, "Compensation is required"],
      min: [0, "Compensation cannot be negative"],
    },
    currency: {
      type: String,
      enum: CURRENCY_VALUES,
      required: [true, "Currency is required"],
      default: DEFAULT_CURRENCY,
    },
    compensationConverted: {
      EGP: { type: Number, default: null },
      SAR: { type: Number, default: null },
      AED: { type: Number, default: null },
      USD: { type: Number, default: null },
      EUR: { type: Number, default: null },
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    removedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Compound unique index - one assignment per employee per project
projectMemberSchema.index({ project: 1, employee: 1 }, { unique: true });
projectMemberSchema.index({ project: 1 });
projectMemberSchema.index({ employee: 1 });

export const ProjectMemberModel =
  mongoose.models.ProjectMember ||
  mongoose.model("ProjectMember", projectMemberSchema);
