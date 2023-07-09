import { EdgesType } from "@app/core";
import { FindAllArgs } from "@app/shared";
import { ArgsType, Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Catalog {
  @Field()
  id: string;
  @Field()
  label: string;
  @Field({ nullable: true })
  value?: string;
  @Field(() => String, { nullable: true })
  image?: string;
}

@ArgsType()
export class FindAllCatalogArgs extends FindAllArgs {
  @Field()
  resource: string;
}

@ObjectType()
export class CatalogEdge extends EdgesType(Catalog) {}
