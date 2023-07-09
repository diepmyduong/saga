import { GqlRefreshTokenAuthGuard, Public, RefreshTokenPayload } from "@app/core";
import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

import { RATE_LIMIT_CONFIG } from "@app/shared";
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";

import { LoginResponse, LoginUserInput } from "./api.auth.dto";
import { ApiLoginUserCommand, ApiLoginUserUsecase, ApiRefreshTokenCommand, ApiRefreshTokenUsecase } from "./usecases";

@Resolver()
export class ApiAuthResolver {
  constructor(
    private readonly loginUsecase: ApiLoginUserUsecase,
    private readonly refreshTokenUsercase: ApiRefreshTokenUsecase
  ) {}

  /** Mutation */
  // Login Mutation
  @Throttle(RATE_LIMIT_CONFIG.login.limit, RATE_LIMIT_CONFIG.login.ttl) // limit login request
  @Public() // allow public access
  @Mutation(() => LoginResponse, { name: "loginUser" })
  async loginUser(
    @Args("input") input: LoginUserInput,
    @Context() context: { req: { res: Response } }
  ): Promise<LoginResponse> {
    // map input to command
    const cmd = ApiLoginUserCommand.create({
      username: input.username,
      password: input.password,
    });
    // execute usecase
    return await this.loginUsecase.execute(cmd, {
      res: context.req.res,
    });
  }

  // Request send email to reset password Mutation
  @Public() // allow public access
  @Mutation(() => String, { name: "forgetPassword" })
  async forgetPassword(@Args("username") username: string) {
    return {};
  }

  // Request refresh token
  @Public()
  @UseGuards(GqlRefreshTokenAuthGuard)
  @Mutation(() => GraphQLJSON, { name: "refreshToken" })
  async refreshToken(@Context() context: { req: { user: RefreshTokenPayload; res: Response } }) {
    const cmd = ApiRefreshTokenCommand.create({
      refreshTokenPayload: context.req.user,
    });
    const result = await this.refreshTokenUsercase.execute(cmd, {
      res: context.req.res,
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }
}
