import { EdgesType } from "@app/core";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
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
}

export const ApplicationEdges = EdgesType(Application);

@InputType()
export class CreateApplicationDto {
  @Field()
  name: string;
}
