import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class InviteApplicationUserInput {
  @Field({ nullable: true })
  email?: string;
  @Field()
  role: string;
}
