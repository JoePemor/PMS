import { User } from "../model/user.model.js";
import { Project } from "../model/project.models.js";
import { Task } from "../model/task.models.js";
import { SubTask } from "../model/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRoleEnum, UserRoles } from "../utils/constants.js";

const createSubTask = asyncHandler(async (req, res) => {
  // ok
});

const getSubTaskById = asyncHandler(async (req, res) => {
  // ok
});

const updateSubTask = asyncHandler(async (req, res) => {
  // ok
});

const deleteSubTask = asyncHandler(async (req, res) => {
  // ok
});
