import { Schema } from "mongoose";
import { MigrationStatusEnum } from "./migration.entity";

const schema = new Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: Object.values(MigrationStatusEnum),
    default: MigrationStatusEnum.PENDING,
  },
  errMsg: { type: String },
  createdAt: { type: Date, required: true },
});

// create index
schema.index({ name: 1 }, { unique: true }); // name is unique

export const MigrationSchema = schema;
