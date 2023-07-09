import { UserTimes } from "@app/dal";
import { Field, InputType, ObjectType, OmitType, PartialType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { TimestampObject } from "../types/common/dto.common";

@ObjectType()
export class User extends TimestampObject {
  // ==== Required Fields
  @Field({ description: "Tên đăng nhập" })
  username: string;
  @Field({ description: "Tên hiển thị" })
  name: string;
  @Field(() => GraphQLJSON, { description: "Thời gian" })
  times: UserTimes;
  @Field({ description: "Vai trò" })
  role: string;
  @Field(() => [String], { description: "Phạm vi quyền" })
  scopes: string[];

  // ==== Nullable Fields
  @Field({ description: "Email", nullable: true })
  email?: string;

  @Field({ description: "Điện thoại", nullable: true })
  phone?: string;
  @Field({ description: "Ảnh đại diện", nullable: true })
  avatar?: string;
}

@InputType()
export class CreateUserInput extends PartialType(OmitType(User, ["id", "createdAt", "updatedAt", "times"]), InputType) {
  @Field({ description: "Mật khẩu người dùng" })
  password: string;
}

@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, ["password", "role"]) {}
