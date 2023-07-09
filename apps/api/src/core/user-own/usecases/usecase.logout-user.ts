import { CoreAuthService } from "@app/core";
import { BaseCommand, BaseUsecase, IsObjectId } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { IsNotEmpty } from "class-validator";
import { Response } from "express";

export class ApiLogoutUserCommand extends BaseCommand {
  @IsObjectId()
  @IsNotEmpty()
  userId: string;
}

@Injectable()
export class LogoutUserUsecase extends BaseUsecase {
  constructor(private readonly authService: CoreAuthService) {
    super();
  }
  // logout user by remove refresh token from database and cookie
  async execute(cmd: ApiLogoutUserCommand, options: { res?: Response } = {}) {
    // inavalidate refresh token
    await this.authService.invalidateRefreshToken(cmd.userId);

    // remove refresh token from cookie
    if (options.res) {
      options.res.clearCookie("x-token");
      options.res.clearCookie("x-refresh-token");
    }
  }
}
