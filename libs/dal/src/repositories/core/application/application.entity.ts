import { ChangePropsValueType, TimestampEntity } from "@app/shared";

export class ApplicationEntity extends TimestampEntity {
  // ==== REQUIRED FIELDS
  code: string; // Mã ứng dụng
  name: string; // Tên ứng dụng

  // ==== Referrences
  ownerId: string; // Chủ app
}

export type ApplicationDbModel = ChangePropsValueType<ApplicationEntity, "_id" | "ownerId">;
