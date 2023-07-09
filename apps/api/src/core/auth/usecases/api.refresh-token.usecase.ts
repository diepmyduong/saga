import { CoreAuthService, RefreshTokenPayload } from "@app/core";
import { BaseCommand, BaseUsecase } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { IsNotEmpty } from "class-validator";
import { Response } from "express";
import { setTokensToCookie } from "../utils/util.set-cookie";

export class ApiRefreshTokenCommand extends BaseCommand {
  @IsNotEmpty()
  refreshTokenPayload: RefreshTokenPayload;
}

@Injectable()
export class ApiRefreshTokenUsecase extends BaseUsecase {
  constructor(private readonly authService: CoreAuthService) {
    super();
  }
  async execute(cmd: ApiRefreshTokenCommand, options: { res?: Response } = {}) {
    const { accessToken, refreshToken, user } = await this.authService.refreshJwtToken(cmd.refreshTokenPayload);

    if (options.res) {
      setTokensToCookie(options.res, accessToken, refreshToken);
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    };
  }
}
