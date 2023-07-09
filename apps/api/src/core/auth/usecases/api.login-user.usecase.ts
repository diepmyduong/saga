import { CoreAuthService } from "@app/core";
import { BaseCommand, BaseUsecase } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { IsNotEmpty, Matches } from "class-validator";
import { setTokensToCookie } from "../utils/util.set-cookie";

export class ApiLoginUserCommand extends BaseCommand {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]{3,30}$/, { message: `Tài khoản không hợp lệ` })
  username: string;

  @IsNotEmpty()
  @Matches(/^\S{3,30}$/, { message: `Mật khẩu không hợp lệ` })
  password: string;
}

@Injectable()
export class ApiLoginUserUsecase extends BaseUsecase {
  constructor(private readonly authService: CoreAuthService) {
    super();
  }

  async execute(cmd: ApiLoginUserCommand, options: { res?: any } = {}) {
    // validate username and password
    const jwtPayload = await this.authService.authenticateByPassword(cmd.username, cmd.password);

    // get jwt token
    const { accessToken, refreshToken: refreshToken } = await this.authService.getJwtToken(jwtPayload);

    if (options.res) {
      setTokensToCookie(options.res, accessToken, refreshToken);
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: jwtPayload,
    };
  }
}
