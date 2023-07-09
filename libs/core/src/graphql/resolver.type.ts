import { Type } from "@nestjs/common";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Pagination {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;
}

export function EdgesType<T extends Type<unknown>>(classRef: T): any {
  @ObjectType({ isAbstract: true })
  abstract class EdgesHost {
    @Field(() => Pagination)
    pagination: Pagination;
    @Field(() => [classRef])
    data: T[];
  }

  const originalName = classRef.name;
  Object.defineProperty(EdgesHost, "name", {
    value: `${originalName}EdgesHost`,
  });

  return EdgesHost;
}
