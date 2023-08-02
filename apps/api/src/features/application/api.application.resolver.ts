import { BaseCRUDResolver, CurrentUser, JwtPayload, Resource } from "@app/core";
import { ApplicationRepository } from "@app/dal";
import { FindAllArgs } from "@app/shared";

import { CommandBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ResourceEnum } from "../../shared";
import { Application, ApplicationEdges, CreateApplicationDto } from "./api.application.dto";
import { CreateApplicationCommand } from "./commands";

@Resource(ResourceEnum.APPLICATION)
@Resolver()
export class ApiApplicationResolver extends BaseCRUDResolver(Application, {
  edgesType: ApplicationEdges,
}) {
  constructor(private appRepo: ApplicationRepository, private commandBus: CommandBus) {
    super(appRepo);
  }

  @Mutation(() => Application, { name: "createApplication" })
  async create(@Args("input") input: CreateApplicationDto, @CurrentUser() user: JwtPayload) {
    return this.commandBus.execute(CreateApplicationCommand.create({ name: input.name, userId: user.userId }));
  }

  @Resource(ResourceEnum.USER_OWN)
  @Query(() => ApplicationEdges, { name: `findAllUserApplication` })
  async findAllUserApplication(@Args() options: FindAllArgs, @CurrentUser() user: JwtPayload) {
    const { page = 1, limit = 20, filter, order, search } = options?.query || {};
    const { data, pagination } = await this.appRepo.findWithPagination({
      filter: {
        ...filter,
        ownerId: user.userId,
      },
      page: page,
      limit: limit,
      sort: order,
      search: search,
    });
    return {
      data: data,
      pagination: pagination,
    };
  }
}
