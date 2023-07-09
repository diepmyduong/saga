import { CurrentUser, JwtPayload, Resource } from "@app/core";
import { ExpressRes } from "@app/shared";
import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { Response } from "express";
import { ResourceEnum, User } from "../../shared";
import { ApiLogoutUserCommand, LogoutUserUsecase, UserGetMeUsecase } from "./usecases";

@Resource(ResourceEnum.USER_OWN)
@Resolver(() => User)
export class ApiUserOwnResolver {
  constructor(
    private readonly logoutUserUsecase: LogoutUserUsecase,
    private readonly userGetMeUsecase: UserGetMeUsecase
  ) {}
  @Query(() => User, { name: "userGetMe" })
  async getMe(@CurrentUser() payload: JwtPayload) {
    return await this.userGetMeUsecase.execute({
      userId: payload.userId,
    });
  }

  // Logout Mutation
  @Resource(ResourceEnum.USER_OWN)
  @Mutation(() => String, { name: "logoutUser" })
  async logoutUser(@ExpressRes() res: Response, @CurrentUser() user: JwtPayload) {
    const cmd = ApiLogoutUserCommand.create({
      userId: user.userId,
    });
    await this.logoutUserUsecase.execute(cmd, { res });

    return "success";
  }
}
