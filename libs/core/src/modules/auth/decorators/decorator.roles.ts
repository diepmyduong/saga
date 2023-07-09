import { SetMetadata } from "@nestjs/common";

// RBAC decorator
export const ROLES_META = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_META, roles);
