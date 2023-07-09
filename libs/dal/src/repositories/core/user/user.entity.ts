import { ChangePropsValueType, TimestampEntity } from "@app/shared";

import { UserRolesEnum, UserTimes } from "./user.type";

export class UserEntity extends TimestampEntity {
  // ==== Required Field
  //  'Tên hiển thị'
  name: string;
  //  'Tên đăng nhập'
  username: string;
  //  'Mật khẩu'
  password: string;
  //  'Vai trò'
  role: UserRolesEnum;
  //  'Phạm vi quyền'
  scopes: string[];
  // Thời gian
  times: UserTimes;

  // ==== Optional Field
  //  'Email'
  email?: string;
  //  'Điện thoại'
  phone?: string;
  //  'Ảnh đại diện'
  avatar?: string;
  // refresh token
  refreshToken?: string;

  // ==== Reference
}

export type UserDbModel = ChangePropsValueType<UserEntity, "_id">;
