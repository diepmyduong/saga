import { StringValidator } from "@app/dal/shared";
import { Schema } from "mongoose";
import { UserRolesEnum } from "./user.type";

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRolesEnum), default: UserRolesEnum.USER },
    scopes: { type: [String], default: [] },
    times: {
      type: {
        lastLoginAt: { type: Date },
        passwordChangedAt: { type: Date },
      },
      default: {},
    },
    email: { type: String, trim: true, validate: StringValidator.email(), require: true },
    // ==== Optional Field
    phone: { type: String, trim: true },
    avatar: { type: String, trim: true },
    // refresh token
    refreshToken: { type: String, trim: true },
  },
  { timestamps: true, collation: { locale: "vi" } }
);

schema.index({ username: 1 }, { unique: true });
schema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } });
schema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true } } });
schema.index(
  { name: "text", username: "text", email: "text", phone: "text" },
  { weights: { name: 1, username: 10, email: 5, phone: 5 } }
);

export const UserSchema = schema;
