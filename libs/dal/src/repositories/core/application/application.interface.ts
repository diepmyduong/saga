/**
 * User in application can have 3 role: write, read or owner
 */
export enum AppUserRole {
  READ = "read",
  WRITE = "write",
  OWNER = "owner",
}

/**
 * Status:
 *  - inviting: Đang mời thành viên
 *  - acitve: Đang hoạt động
 *  - blocked: Tạm khoá
 */
export enum AppUserStatus {
  INVITING = "inviting",
  ACTIVE = "active",
  BLOCKED = "blocked",
}

/**
 * This is a user of app, owner can invite by email and set a role
 * After accept invite, user will be added to user list of app
 */
export type ApplicationUser = {
  email: string; // Email
  role: AppUserRole; // Quyền tài khoản
  status: AppUserStatus; // Trạng thái tài khoản
  userId?: string; // Mã tài khoản
};
