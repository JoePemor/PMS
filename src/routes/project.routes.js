import { Router } from "express";
import { UserRoles, UserRoleEnum } from "../utils/constants.js";
import {
  addMembersToProject,
  createProject,
  deleteMember,
  getProjects,
  getProjectById,
  getProjectMembers,
  updateProject,
  deleteProject,
  updateMemberRole,
} from "../controller/project.controller.js";
import { validateReq } from "../middleware/validator.middlewares.js";
import {
  createProjectValidator,
  addMembersToProjectValidator,
} from "../validators/main.validator.js";
import { verifyJWT, roleBaseAccess } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validateReq, createProject);

router
  .route("/:projectId")
  .get(roleBaseAccess(UserRoles), getProjectById)
  .put(
    roleBaseAccess([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    updateProject,
  )
  .delete(roleBaseAccess([UserRoleEnum.ADMIN]), deleteProject);

router
  .route("/:projectId/members")
  .get(roleBaseAccess(UserRoles), getProjectMembers)
  .post(
    roleBaseAccess([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    addMembersToProjectValidator(),
    validateReq,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(roleBaseAccess([UserRoleEnum.ADMIN]), updateMemberRole)
  .delete(
    roleBaseAccess([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    deleteMember,
  );

export default router
