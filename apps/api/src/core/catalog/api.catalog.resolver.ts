import { CurrentUser, JwtPayload, Resource } from "@app/core";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { ResourceEnum } from "../../shared";
import { Catalog, CatalogEdge, FindAllCatalogArgs } from "./api.catalog.dto";
import { FindAllCatalogCommand, FindAllCatalogUsecase, FindOneCatalogCommand, FindOneCatalogUsecase } from "./usecases";

@Resource(ResourceEnum.CATALOG)
@Resolver()
export class ApiCatalogResolver {
  constructor(
    private readonly findAllCatalogUsecase: FindAllCatalogUsecase,
    private readonly findOneCatalogUsecase: FindOneCatalogUsecase
  ) {}

  @Query(() => CatalogEdge, { name: `findAllCatalog` })
  async findAll(@Args() options: FindAllCatalogArgs, @CurrentUser() user: JwtPayload) {
    return this.findAllCatalogUsecase.execute(
      FindAllCatalogCommand.create({
        userId: user.userId,
        resource: options.resource,
        query: options.query,
      })
    );
  }

  @Query(() => Catalog, { name: `findOneCatalog` })
  async findOne(@Args("id") id: string, @Args("resource") resource: string, @CurrentUser() user: JwtPayload) {
    return this.findOneCatalogUsecase.execute(
      FindOneCatalogCommand.create({
        userId: user.userId,
        resource: resource,
        id: id,
      })
    );
  }
}
