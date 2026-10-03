import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../model/user.model.js";
import {
  sendMail,
  emailVerificationMailgenContent,
  forgetPasswordMailgenContent,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateRefreshAndAccessToken = async (UserId) => {
  const user = await User.findById(UserId);

  if (!user) {
    throw new ApiError(400, "user not found", []);
  }
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went Wrong while generation tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, phoneNumber, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }, { phoneNumber }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exits", []);
  }

  const user = await User.create({
    username,
    email,
    phoneNumber,
    password,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  await sendMail({
    email: user?.email,
    subject: "Hello from Project Manager",
    mailgenContent: emailVerificationMailgenContent(
      username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });

  const newUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationExpiry -emailVerificationToken",
  );

  if (!newUser) {
    throw new ApiError(500, "failed to register User", []);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { User: newUser },
        "user successfully registered to database",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password required to login");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user not found or does not exits");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid credential");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    user._id,
  );

  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationExpiry -emailVerificationToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loginUser }, "user Successfully login"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const loggedOutUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  ).select(
    "-password -refreshToken -emailVerificationExpiry -emailVerificationToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        { User: loggedOutUser },
        "User Successfully logged out",
      ),
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "request successful"));
});

const verifyUserEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(404, "verification token not found");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token invalid or expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "email verification successful",
      ),
    );
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "user Not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "user email is already verified");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  await sendMail({
    email: user?.email,
    subject: "Hello from Project Manager",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email successfully resend to user"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const mainRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!mainRefreshToken) {
    throw new ApiError(401, "Unauthorize Access, no refresh token passed");
  }

  try {
    const decodedToken = jwt.verify(
      mainRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    if (mainRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Expired refreshToken/ invaild Token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateRefreshAndAccessToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, {}, "access token succefully refreshed"));
  } catch (err) {
    throw new ApiError(400, "invalid token");
  }
});

const forgetPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user?.email,
    subject: "reset password request email",
    mailgenContent: forgetPasswordMailgenContent(
      user?.username,
      `${process.env.FORGET_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "reset password request email sent to user"),
    );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  if (!resetToken || !newPassword) {
    throw new ApiError(400, "Reset token and new password are required");
  }
  
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgetPasswordToken: hashedResetToken,
    forgetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(409, "invalid token or expired token");
  }

  user.forgetPasswordToken = undefined;
  user.forgetPasswordExpiry = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password Successfully reset"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  if (!oldPassword) {
    throw new ApiError(400, "Old password is required");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid OldPassword");
  }

  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password Successfully save"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyUserEmail,
  resendVerificationEmail,
  refreshAccessToken,
  forgetPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
};
