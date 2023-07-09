import { ChangePropsValueType, TimestampEntity } from "@app/shared";

export enum SettingType {
  string = "string",
  number = "number",
  array = "array",
  object = "object",
  richText = "richText",
  boolean = "boolean",
}

export class SettingEntity extends TimestampEntity {
  /** ==== REQUIRED FIELDS */
  //  'Loại dữ liệu'
  type: SettingType;

  //  'Tên setting'
  name: string;

  //  'Mã setting'
  key: string;

  //  'Giá trị setting'
  value: any;

  //  'Kích hoạt'
  isActive: boolean;

  // Nhóm setting
  group: string;
}

export type SettingDbModel = ChangePropsValueType<SettingEntity, "_id">;
