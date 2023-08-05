import { ChangePropsValueType, TimestampEntity } from "@app/shared";
import { ApplicationUser } from "./application.interface";

export class ApplicationEntity extends TimestampEntity {
  // ==== REQUIRED FIELDS
  code: string; // Mã ứng dụng
  name: string; // Tên ứng dụng
  users: ApplicationUser[];

  // ==== Referrences
  ownerId: string; // Chủ app

  // ==== Method
  // get app user by email
  getUserByEmail(email: string) {
    if (this.users) {
      return this.users.find((u) => u.email === email);
    }
  }
}

export type ApplicationDbModel = ChangePropsValueType<ApplicationEntity, "_id" | "ownerId">;
