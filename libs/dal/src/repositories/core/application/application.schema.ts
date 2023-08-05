import { Schema } from "mongoose";
import { AppUserRole, AppUserStatus } from "./application.interface";

const schema = new Schema(
  {
    // ==== REQUIRED FIELD
    code: { type: String, require: true, trim: true },
    name: { type: String, require: true, trim: true },
    users: {
      type: [
        {
          email: { type: String, trim: true, require: true },
          role: { type: String, enum: Object.values(AppUserRole), require: true },
          status: { type: String, enum: Object.values(AppUserStatus), require: true },
          userId: { type: Schema.Types.ObjectId },
        },
      ],
      require: true,
    },
    // ==== REFERRENCES
    ownerId: { type: Schema.Types.ObjectId, require: true },
  },
  { timestamps: true }
);

schema.index({ code: "text", name: "text" }, { weights: { code: 10, name: 5 } });
schema.index({ code: 1 }, { unique: true });

export const ApplicationSchema = schema;
