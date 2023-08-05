import { JWT_CONFIG, t } from "@app/shared";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import passwordHash from "password-hash";
import { JwtPayload, RefreshTokenPayload } from "./types";

@Injectable()
export class CoreAuthService {
  protected logger = new Logger(this.constructor.name);
  constructor(protected readonly jwtService: JwtService) {}

  // throw same error
  get InvalidCredentialsException() {
    throw new BadRequestException(t(`Tài khoản hoặc mật khẩu không hợp lệ`));
  }

  // Get jwt token from jwt payload
  async getJwtToken(payload: JwtPayload) {
    // genrate refresh token with random password
    const randomPassword = randomUUID();
    const hashedPassword = await passwordHash.generate(randomPassword);

    const refreshToken = await this.jwtService.sign(
      { userId: payload.userId, hash: randomPassword },
      { expiresIn: JWT_CONFIG.refreshExpiresIn }
    );

    const accessToken = await this.getAccessToken(payload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      hashedRefreshToken: hashedPassword,
    };
  }

  // Generate Access Token from payload
  async getAccessToken(payload: JwtPayload) {
    return await this.jwtService.sign(payload, {
      expiresIn: JWT_CONFIG.signExpiresIn,
    });
  }

  // verify refresh token
  async verifyRefreshToken(token: string) {
    // encode token
    const payload: RefreshTokenPayload = await this.jwtService.verify(token);
    if (!payload || !payload.userId || !payload.hash) {
      throw new Error("Invalid refresh token");
    }
    return payload;
  }

  // validate refresh token
  async validateRefreshToken(payload: RefreshTokenPayload, hashedRefreshToken: string) {
    const { hash } = payload;
    return passwordHash.verify(hash, hashedRefreshToken);
  }
}
