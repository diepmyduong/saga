import { JWT_CONFIG, PermissionException } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

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
