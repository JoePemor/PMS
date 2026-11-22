import { body } from "express-validator";
import { UserRoleEnum } from "../utils/constants.js";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("field is required")
      .isEmail()
      .withMessage("invalid email format"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("field is required")
      .isNumeric()
      .withMessage("Phone number must contain only numbers")
      .isLength({ min: 10, max: 15 })
      .withMessage("Phone number must be between 10 and 15 digits"),
    body("username")
      .notEmpty()
      .withMessage("field is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("username must be between 3 to 30 charaters long"),
    body("password")
      .notEmpty()
      .withMessage("field is required")
      .isLength({ min: 8 })
      .withMessage("password must be atleast 8 charaters long"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("field is required")
      .isEmail()
      .withMessage("invalid email format"),
    body("password").notEmpty().withMessage("field is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("old password is required"),
    body("newPassword").notEmpty().withMessage("new password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("field is required")
      .isEmail()
      .withMessage("invalid email format"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [
    body("newPassword").notEmpty().withMessage("new password is required"),
  ];
};

const createProjectValidator = () => {
  return [
    body("name")
      .isString()
      .withMessage("Project name must be a string")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Project name is required"),

    body("description")
      .optional({ checkFalsy: true })
      .isString()
      .withMessage("Project description must be a string")
      .bail()
      .trim(),
  ];
};

const addMembersToProjectValidator = () => {
  return [
    body("email")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .notEmpty()
      .withMessage("Email is required"),

    body("role")
      .optional()
      .isIn([UserRoleEnum.MEMBER])
      .withMessage(
        `Role must be one of: ${Object.values(UserRoleEnum).join(", ")}`,
      ),
  ];
};

export {
  userRegistrationValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMembersToProjectValidator,
};
