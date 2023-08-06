import { AppId, BaseCRUDResolver, CurrentUser, JwtPayload, Resource } from "@app/core";
import { AppUserStatus, ApplicationRepository } from "@app/dal";
import { FindAllArgs } from "@app/shared";

import { CommandBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { ResourceEnum } from "../../shared";
import { InviteApplicationUserInput } from "./api.application-own.dto";
import { Application, ApplicationEdges, CreateApplicationDto } from "./api.application.dto";
import { CreateApplicationCommand, InviteApplicationUserCommand, JoinApplicationCommand } from "./commands";

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
        users: {
          $elemMatch: {
            userId: user.userId,
            status: AppUserStatus.ACTIVE,
          },
        },
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

  // get app info
  @Resource(ResourceEnum.APPLOCATION_OWN)
  @Query(() => Application, { name: "getApplication" })
  async getApplication(@AppId() appId: string) {
    return this.appRepo.findById(appId);
  }

  // invite app user
  @Resource(ResourceEnum.APPLOCATION_OWN)
  @Mutation(() => GraphQLJSON, { name: "inviteApplicationUser" })
  async invite(
    @Args("input") input: InviteApplicationUserInput,
    @CurrentUser() user: JwtPayload,
    @AppId() appId: string
  ) {
    return this.commandBus.execute(
      InviteApplicationUserCommand.create({
        userId: user.userId,
        appId: appId,
        email: input.email,
        role: input.role,
      })
    );
  }

  // join application
  @Resource(ResourceEnum.USER_OWN)
  @Mutation(() => GraphQLJSON, { name: "joinApplication" })
  async join(@Args("inviteToken") inviteToken: string, @CurrentUser() user: JwtPayload) {
    return this.commandBus.execute(JoinApplicationCommand.create({ userId: user.userId, inviteToken: inviteToken }));
  }

  //
}
