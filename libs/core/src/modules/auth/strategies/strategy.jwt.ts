import { JWT_CONFIG, PermissionException } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RefreshTokenPayload } from "../base/auth.jwt.interface";
import { CoreAuthService } from "../core.auth.service";

const ExtractJwtFromCookie = (schema: string) => (req: Request) => {
  return req.cookies[schema];
};
const ExtractJwtByHeaderRole = () => (req: Request) => {
  const role = req.headers["x-role"] || "user";
  let schema = "x-" + role + "-token";
  return req.cookies[schema] || req.headers[schema];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      // extract jwt from cookie or header
      jwtFromRequest: ExtractJwt.fromExtractors([
        // extract from cookie
        ExtractJwtByHeaderRole(),
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_CONFIG.secret,
    });
  }

  async validate(payload: any) {
    if (!payload.userId || !payload.username || !payload.role) {
      throw new PermissionException();
    }
    return payload;
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refresh-token") {
  constructor(private readonly authService: CoreAuthService) {
    super({
      // extract jwt from cookie or header
      jwtFromRequest: ExtractJwt.fromExtractors([
        // extract from cookie
        ExtractJwtFromCookie("x-refresh-token"),
        // extract from auth header bearer token
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // extract from header x-token
        ExtractJwt.fromAuthHeaderWithScheme("x-refresh-token"),
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_CONFIG.secret,
    });
  }

  async validate(payload: RefreshTokenPayload) {
    if (!payload.userId || !payload.hash) {
      throw new PermissionException();
    }
    // check refresh token
    await this.authService.validateRefreshToken(payload);
    return payload;
  }
}
