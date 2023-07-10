import { CurrentUser, JwtPayload, Resource } from "@app/core";
import { ExpressRes } from "@app/shared";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Response } from "express";
import { ResourceEnum, User } from "../../shared";
import { UserUpdateProfileInput } from "./api.user-own.dto";
import {
  ApiLogoutUserCommand,
  LogoutUserUsecase,
  UserGetMeUsecase,
  UserUpdateProfileCommand,
  UserUpdateProfileUsecase,
} from "./usecases";

@Resource(ResourceEnum.USER_OWN)
@Resolver(() => User)
export class ApiUserOwnResolver {
  constructor(
    private readonly logoutUserUsecase: LogoutUserUsecase,
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
    const cmd = ApiLogoutUserCommand.create({
      userId: user.userId,
    });
    await this.logoutUserUsecase.execute(cmd, { res });

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
