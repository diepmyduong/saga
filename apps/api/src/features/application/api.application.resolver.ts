import { BaseCRUDResolver, CurrentUser, JwtPayload, Resource } from "@app/core";
import { ApplicationRepository } from "@app/dal";
import { CommandBus } from "@nestjs/cqrs";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
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
}
