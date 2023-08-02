import { Schema } from "mongoose";

const schema = new Schema(
  {
    // ==== REQUIRED FIELD
    code: { type: String, require: true, trim: true },
    name: { type: String, require: true, trim: true },

    // ==== REFERRENCES
    ownerId: { type: Schema.Types.ObjectId, require: true },
  },
  { timestamps: true }
);

schema.index({ code: "text", name: "text" }, { weights: { code: 10, name: 5 } });
schema.index({ code: 1 }, { unique: true });

export const ApplicationSchema = schema;
