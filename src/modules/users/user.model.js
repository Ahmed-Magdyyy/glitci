import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { USER_ROLES } from "../../shared/constants/userRoles.enums.js";

const DEFAULT_USER_AVATAR_URL =
  "https://res.cloudinary.com/dx5n4ekk2/image/upload/v1767069108/petyard/users/user_default_avatar_2.svg";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    image: {
      public_id: { type: String, default: null },
      url: { type: String, default: DEFAULT_USER_AVATAR_URL },
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
      default: null,
    },
    tempPassword: {
      type: String,
      select: false,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: [true, "Role is required"],
      default: USER_ROLES.EMPLOYEE,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpire: Date,
    passwordResetCodeVerified: Boolean,

    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          expiresAt: { type: Date, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ "refreshTokens.expiresAt": 1 });

userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified("tempPassword") && this.tempPassword) {
    this.tempPassword = await bcrypt.hash(this.tempPassword, 12);
  }
});

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
