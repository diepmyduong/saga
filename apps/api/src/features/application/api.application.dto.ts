import { EdgesType } from "@app/core";
import { ApplicationUser } from "@app/dal/repositories/core/application/application.interface";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { TimestampObject } from "../../shared";

@ObjectType()
export class Application extends TimestampObject {
  @Field()
  id: string;
  @Field()
  code: string;
  @Field()
  name: string;
  @Field()
  ownerId: string;
  @Field(() => [GraphQLJSON])
  users: ApplicationUser[];
}

export const ApplicationEdges = EdgesType(Application);

@InputType()
export class CreateApplicationDto {
  @Field()
  name: string;
}
