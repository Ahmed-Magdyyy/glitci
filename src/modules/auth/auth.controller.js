// src/modules/auth/auth.controller.js
import asyncHandler from "express-async-handler";
import {
  // registerService,
  loginService,
  refreshTokenService,
  logoutService,
  changePasswordService,
  forgetPasswordService,
  verifyPasswordResetCodeService,
  resetPasswordService,
  buildAuthUserResponse,
} from "./auth.service.js";

// Cookie options for refresh token only
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Helper to set refresh token cookie
function setRefreshTokenCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
}

// Helper to clear refresh token cookie
function clearRefreshTokenCookie(res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

// // POST /auth/signup - No tokens, user must login after
// export const register = asyncHandler(async (req, res) => {
//   const { user } = await registerService({
//     ...req.body,
//     imageFile: req.file,
//   });

//   res.status(201).json({
//     status: "success",
//     message: "User registered successfully. Please login.",
//     data: buildAuthUserResponse(user),
//   });
// });

// POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken, accessTokenExpires } =
    await loginService(req.body);

  // Set refresh token in httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // Return access token in body (FE handles storage)
  res.status(200).json({
    data: buildAuthUserResponse(user),
    accessToken,
    accessTokenExpires,
  });
});

// POST /auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie
  const incoming = req.cookies?.refreshToken;

  const { accessToken, refreshToken, accessTokenExpires } =
    await refreshTokenService({ refreshToken: incoming });

  // Set new refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    accessToken,
    accessTokenExpires,
  });
});

// POST /auth/logout
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  await logoutService({ userId: req.user._id, refreshToken });

  clearRefreshTokenCookie(res);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// PATCH /auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await changePasswordService({
    userId: req.user._id,
    currentPassword,
    newPassword,
  });

  clearRefreshTokenCookie(res);

  res.status(200).json({
    status: "success",
    message: "Password changed successfully. Please login again.",
  });
});

// POST /auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { resetCode } = await forgetPasswordService(req.body);

  res.status(200).json({
    status: "success",
    message: "Reset code sent to email",
    resetCode, // Remove in production
  });
});

// POST /auth/verify-reset-code
export const verifyResetCode = asyncHandler(async (req, res) => {
  await verifyPasswordResetCodeService(req.body);

  res.status(200).json({
    status: "success",
    message: "Reset code verified",
  });
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordService(req.body);

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});
