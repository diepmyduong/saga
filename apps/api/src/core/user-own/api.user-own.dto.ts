import { Field, InputType } from "@nestjs/graphql";

// User update profile input
@InputType()
export class UserUpdateProfileInput {
  @Field({ nullable: true })
  name?: string; // Tên người dùng
  @Field({ nullable: true })
  avatar?: string; // Ảnh đại diện
  @Field({ nullable: true })
  phone?: string; // Số điện thoại
  @Field({ nullable: true })
  address?: string; // Địa chỉ
}
