import { Schema } from "mongoose";
import { SettingType } from "./setting.entity";

const schema = new Schema(
  {
    type: { type: String, enum: Object.values(SettingType), required: true, default: SettingType.string },
    name: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    isActive: { type: Boolean, required: true, default: true },
    group: { type: String, required: true },
  },
  { timestamps: true, collation: { locale: "vi" } }
);

schema.index({ key: 1 }, { unique: true });
schema.index({ name: "text", key: "text" }, { weights: { name: 2, key: 4 } });

export const SettingSchema = schema;
