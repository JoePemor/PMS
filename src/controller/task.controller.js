import { User } from "../model/user.model.js";
import { Project } from "../model/project.models.js";
import { Task } from "../model/task.models.js";
import { SubTask } from "../model/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRoleEnum, UserRoles } from "../utils/constants.js";

const getTask = asyncHandler(async (req, res) => {
  // ok
});

const CreateTask = asyncHandler(async (req, res) => {
  // ok
});

const getTaskId = asyncHandler(async (req, res) => {
  // ok
});

const updateTask = asyncHandler(async (req, res) => {
  // ok
});

const deleteTask = asyncHandler(async (req, res) => {
  // ok
});
