import mongoose from "mongoose";

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
