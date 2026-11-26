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
  const { projectId, taskId } = req.params;

  if (
    !mongoose.isValidObjectId(projectId) ||
    !mongoose.isValidObjectId(taskId)
  ) {
    throw new ApiError(400, "invalid project credentials", []);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found", []);
  }

  const taskDetails = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              avatar: 1,
              email: 1,
              username: 1,
              phoneNumber: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedBy",
        pipeline: [
          {
            $project: {
              _id: 1,
              avatar: 1,
              email: 1,
              username: 1,
              phoneNumber: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "Subtask",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    avatar: 1,
                    email: 1,
                    username: 1,
                    phoneNumber: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
    {
      $addFields: {
        assignedBy: {
          $arrayElemAt: ["$assignedBy", 0],
        },
      },
    },
  ]);

  if (!taskDetails || taskDetails.length === 0) {
    throw new ApiError(404, "Task not found", []);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { task: taskDetails },
        `task details successfully fetched at ${new Date(Date.now())}`,
      ),
    );
});

const CreateTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "invalid project credentials", []);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found", []);
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.STORAGE_URL}/image/${file.filename}`,
      mimeType: file.mimeType,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    status,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    assignedBy: new mongoose.Types.ObjectId(req.user?._id),
    attachments,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { task },
        `task successfully created at ${new Date(Date.now())}`,
      ),
    );
});

const getTaskId = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "invalid project credentials", []);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found", []);
  }

  const task = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username email");

  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { task },
        `task successfully fetched at ${new Date(Date.now())}`,
      ),
    );
});

const updateTask = asyncHandler(async (req, res) => {
  // ok
});

const deleteTask = asyncHandler(async (req, res) => {
  // ok
});

export {
  getTask,
  getTaskId,
  CreateTask,
  updateTask,
  deleteTask
};