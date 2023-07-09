import { BaseEntity, ChangePropsValueType } from "@app/shared";

export enum MigrationStatusEnum {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export class MigrationEntity extends BaseEntity {
  name: string; // Tên file migration
  status: MigrationStatusEnum; // Trạng thái migration
  errMsg: string; // Lỗi khi chạy migration
  createdAt: Date; // Ngày tạo
}

export type MigrationDbModel = ChangePropsValueType<MigrationEntity, "_id">;
