export const UserRoleEnum = {
  ADMIN: 'admin',
  PROJECT_ADMIN: 'project_admin',
  MEMBER: 'member',
};

export const UserRoles = Object.values(UserRoleEnum);

export const TaskStatusEnum = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

export const TaskStatuses = Object.values(TaskStatusEnum);
