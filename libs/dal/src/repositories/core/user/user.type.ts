import { Type } from "class-transformer";

export class UserTimes {
  @Type(() => Date)
  activeAt?: Date; // Ngày kích hoạt
  @Type(() => Date)
  inactiveAt?: Date; // Ngày ngưng kích hoạt
  @Type(() => Date)
  blockedAt?: Date; // Ngày khoá
  @Type(() => Date)
  lastLoginAt?: Date; // Ngày đăng nhập
  @Type(() => Date)
  passwordChangedAt?: Date; // Ngày đổi mật khẩu
}

export enum UserRolesEnum {
  ADMIN = "ADMIN",
  USER = "USER",
}
