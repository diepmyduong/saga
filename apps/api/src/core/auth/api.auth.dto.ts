import { JwtPayload } from "@app/core/modules/auth";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class LoginData {
  @Field(() => GraphQLJSON, { description: "Thông tin người dùng", nullable: true })
  user: JwtPayload;

  @Field({ description: "Access Token", nullable: true })
  accessToken: string;

  @Field({ description: "Refresh Token", nullable: true })
  refreshToken: string;
}

@InputType()
export class LoginUserInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => GraphQLJSON)
  user: JwtPayload;
}
