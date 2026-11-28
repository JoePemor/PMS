import { body } from "express-validator";
import { TaskStatuses } from "../utils/constants.js";
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

const createTaskValidator = () => {
  return [
    body().custom((value) => {
      const allowedFields = ["title", "description", "assignedTo", "status"];

      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Request body must be a valid object");
      }

      const unexpectedFields = Object.keys(value).filter(
        (field) => !allowedFields.includes(field),
      );

      if (unexpectedFields.length) {
        throw new Error(`Unexpected fields: ${unexpectedFields.join(", ")}`);
      }

      return true;
    }),

    body("title")
      .isString()
      .withMessage("Task title must be a string")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Task title is required"),

    body("description")
      .optional()
      .isString()
      .withMessage("Task description must be a string")
      .bail()
      .trim(),

    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignee ID"),

    body("status")
      .optional()
      .isString()
      .withMessage("Task status must be a string")
      .bail()
      .isIn(TaskStatuses)
      .withMessage(`Task status must be one of: ${TaskStatuses.join(", ")}`),
  ];
};

const updateTaskValidator = () => {
  return [
    body().custom((value) => {
      const allowedFields = ["title", "description", "assignedTo", "status"];

      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Request body must be a valid object");
      }

      const fields = Object.keys(value);

      if (fields.length === 0) {
        throw new Error("Provide at least one field to update");
      }

      const unexpectedFields = fields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (unexpectedFields.length) {
        throw new Error(`Unexpected fields: ${unexpectedFields.join(", ")}`);
      }

      return true;
    }),

    body("title")
      .optional()
      .isString()
      .withMessage("Task title must be a string")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Task title cannot be empty"),

    body("description")
      .optional()
      .isString()
      .withMessage("Task description must be a string")
      .bail()
      .trim(),

    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignee ID"),

    body("status")
      .optional()
      .isString()
      .withMessage("Task status must be a string")
      .bail()
      .isIn(TaskStatuses)
      .withMessage(`Task status must be one of: ${TaskStatuses.join(", ")}`),
  ];
};

const updateTaskStatusValidator = () => {
  return [
    body().custom((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Request body must be a valid object");
      }

      const fields = Object.keys(value);

      if (fields.length !== 1 || fields[0] !== "status") {
        throw new Error("Only the status field is allowed");
      }

      return true;
    }),

    body("status")
      .isString()
      .withMessage("Task status must be a string")
      .bail()
      .isIn(TaskStatuses)
      .withMessage(`Task status must be one of: ${TaskStatuses.join(", ")}`),
  ];
};

/**
 * createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
 */

export {
  userRegistrationValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMembersToProjectValidator,
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
};
