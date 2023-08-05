import { AppId, CurrentUser, JwtPayload, Resource } from "@app/core";
import { CommandBus } from "@nestjs/cqrs";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { ResourceEnum } from "../../shared";
import { InviteApplicationUserInput } from "./api.application-own.dto";
import { InviteApplicationUserCommand } from "./commands";

@Resource(ResourceEnum.APPLOCATION_OWN)
@Resolver()
export class ApiApplicationOwnResolver {
  constructor(private commandBus: CommandBus) {}
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
}
