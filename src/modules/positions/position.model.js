import mongoose from "mongoose";

const positionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Position name is required"],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes
positionSchema.index({ department: 1 });
positionSchema.index({ name: 1, department: 1 }, { unique: true });

export const PositionModel =
  mongoose.models.Position || mongoose.model("Position", positionSchema);
