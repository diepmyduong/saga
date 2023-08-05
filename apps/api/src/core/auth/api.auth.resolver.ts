import { LoginUserCommand, Public, RefreshUserTokenCommand } from "@app/core";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

import { ExpressRes, RATE_LIMIT_CONFIG } from "@app/shared";
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";

import { CommandBus } from "@nestjs/cqrs";
import { LoginResponse, LoginUserInput } from "./api.auth.dto";
import { setTokensToCookie } from "./utils";

@Resolver()
export class ApiAuthResolver {
  constructor(private commandBus: CommandBus) {}

  /** Mutation */
  // Login Mutation
  @Throttle(RATE_LIMIT_CONFIG.login.limit, RATE_LIMIT_CONFIG.login.ttl) // limit login request
  @Public() // allow public access
  @Mutation(() => LoginResponse, { name: "loginUser" })
  async loginUser(@Args("input") input: LoginUserInput, @ExpressRes() res: Response): Promise<LoginResponse> {
    const result = await this.commandBus.execute<LoginUserCommand>(
      LoginUserCommand.create({
        username: input.username,
        password: input.password,
      })
    );
    // set cookie
    setTokensToCookie(res, "user", result.accessToken);
    return result;
  }

  // Request refresh token
  @Public()
  @Mutation(() => GraphQLJSON, { name: "refreshToken" })
  async refreshToken(@Args("refreshToken") refreshToken: string, @ExpressRes() res: Response) {
    const result = await this.commandBus.execute(
      RefreshUserTokenCommand.create({
        refreshToken: refreshToken,
      })
    );
    // set cookie
    setTokensToCookie(res, "user", result.accessToken);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  // Request send email to reset password Mutation
  @Public() // allow public access
  @Mutation(() => String, { name: "forgetPassword" })
  async forgetPassword(@Args("username") username: string) {
    return {};
  }
}
