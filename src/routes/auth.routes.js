import { Router } from "express";
import {
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
} from "../controller/auth.controller.js";
import { validateReq } from "../middleware/validator.middlewares.js";
import {
  userRegistrationValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
} from "../validators/main.validator.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// unsecure route {cause no jwt token}
router
  .route("/register")
  .post(userRegistrationValidator(), validateReq, registerUser);
router.route("/login").post(userLoginValidator(), validateReq, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyUserEmail);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validateReq, forgetPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validateReq, resetForgotPassword);

// secure route {jwt need}
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validateReq,
    changeCurrentPassword,
  );
router
  .route("/resend-email-verification")
  .get(verifyJWT, resendVerificationEmail);

export default router;
