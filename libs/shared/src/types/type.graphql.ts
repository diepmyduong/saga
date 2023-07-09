import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class FindAllQueryInput {
  @Field(() => GraphQLJSON, { nullable: true })
  filter?: JSON;
  @Field(() => Int, { nullable: true })
  page?: number;
  @Field(() => Int, { nullable: true })
  limit?: number;
  @Field(() => GraphQLJSON, { nullable: true })
  order?: JSON;
  @Field({ nullable: true })
  search?: string;
}

@ArgsType()
export class FindAllArgs {
  @Field(() => FindAllQueryInput, { nullable: true })
  query?: FindAllQueryInput;
}
