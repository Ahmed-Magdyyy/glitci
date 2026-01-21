import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      // lowercase: true,
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes
skillSchema.index({ position: 1 });
skillSchema.index({ name: 1, position: 1 }, { unique: true });

export const SkillModel =
  mongoose.models.Skill || mongoose.model("Skill", skillSchema);
