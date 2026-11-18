import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Note } from "../models/note.models.js";
import { Task } from "../models/task.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRoleEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "invaild project requirement credentials", []);
  }

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user?._id),
  });

  const projectMember = await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user?._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRoleEnum.ADMIN,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { project, projectMember },
        `project successfully created at ${Date.now()}`,
      ),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "invalid project id", []);
  }

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "invalid project credentials", []);
  }

  const deletedProject = await Project.findByIdAndDelete(projectId);

  if (!deletedProject) {
    throw new ApiError(404, "project not found", []);
  }

  const deletedMembers = await ProjectMember.deleteMany({
    project: projectId,
  });

  if (!deletedMembers) {
    throw new ApiError(404, "project members not found", []);
  }

  const deletedNotes = await Note.deleteMany({
    project: projectId,
  });

  if (!deletedNotes) {
    throw new ApiError(404, "project notes not found", []);
  }

  const deletedTasks = await Task.deleteMany({
    project: projectId,
  });

  if (!deletedTasks) {
    throw new ApiError(404, "project tasks not found", []);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedProject,
        deletedMembers,
        deletedNotes,
        deletedTasks,
        deletedSubTasks,
      },
      `project successfully deleted at ${Date.now()}`,
    ),
  );
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "invalid project id", []);
  }

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "invalid project credentials", []);
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    {
      new: true,
    },
  );

  if (!updatedProject) {
    throw new ApiError(404, "project not found", []);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedProject },
        `project successfully updated at ${Date.now()}`,
      ),
    );
});

const getProjects = asyncHandler(async (req, res) => {
  const project = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectmembers",
            },
          },
          {
            $addfields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$project",
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        members: 1,
        createdAt: 1,
        createdBy: 1,
      },
      _id: 0,
      role: 1,
    },
  ]);
});

const addMembersToProject = asyncHandler(async (req, res) => {
  // test
});

const deleteMember = asyncHandler(async (req, res) => {
  // test
});

const getProjectById = asyncHandler(async (req, res) => {
  // test
});

const getProjectMembers = asyncHandler(async (req, res) => {
  // test
});

const updateMemberRole = asyncHandler(async (req, res) => {
  // test
});

export {
  addMembersToProject,
  createProject,
  deleteMember,
  getProjects,
  getProjectById,
  getProjectMembers,
  updateProject,
  deleteProject,
  updateMemberRole,
};
