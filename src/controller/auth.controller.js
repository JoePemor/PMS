import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { sendMail, emailVerificationMailgenContent } from "../utils/mail.js";
import { User } from "../model/user.model.js";

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
      `${req.protocol}://${req.get("host")}/api/v1/verify-email/${unHashedToken}`,
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

export { registerUser, generateRefreshAndAccessToken };
