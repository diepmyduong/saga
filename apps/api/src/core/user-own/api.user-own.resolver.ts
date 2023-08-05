import { CurrentUser, JwtPayload, LogoutUserCommand, Resource } from "@app/core";
import { ExpressRes } from "@app/shared";
import { CommandBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Response } from "express";
import { ResourceEnum, User } from "../../shared";
import { UserUpdateProfileInput } from "./api.user-own.dto";
import { UserGetMeUsecase, UserUpdateProfileCommand, UserUpdateProfileUsecase } from "./usecases";

@Resource(ResourceEnum.USER_OWN)
@Resolver(() => User)
export class ApiUserOwnResolver {
  constructor(
    private commandBus: CommandBus,
    private readonly userGetMeUsecase: UserGetMeUsecase,
    private readonly userUpdateProfileUsecase: UserUpdateProfileUsecase
  ) {}

  @Query(() => User, { name: "userGetMe" })
  async getMe(@CurrentUser() payload: JwtPayload) {
    return await this.userGetMeUsecase.execute({
      userId: payload.userId,
    });
  }

  // Logout Mutation
  @Mutation(() => String, { name: "logoutUser" })
  async logoutUser(@ExpressRes() res: Response, @CurrentUser() user: JwtPayload) {
    await this.commandBus.execute(LogoutUserCommand.create({ userId: user.userId }));
    return "success";
  }

  // Update profile Mutation
  @Mutation(() => User, { name: "userUpdateProfile" })
  async updateProfile(@Args("input") input: UserUpdateProfileInput, @CurrentUser() payload: JwtPayload) {
    const cmd = UserUpdateProfileCommand.create({
      userId: payload.userId,
      name: input.name,
      avatar: input.avatar,
      phone: input.phone,
      address: input.address,
    });
    return await this.userUpdateProfileUsecase.execute(cmd);
  }
}
