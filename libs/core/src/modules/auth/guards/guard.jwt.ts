import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { PUBLIC_META } from "../decorators";
import { GqlGuard } from "./common";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_META, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: Error, user: any, info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class GqlJwtAuthGuard extends GqlGuard(JwtAuthGuard) {}

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard("refresh-token") implements CanActivate {
  handleRequest(err: Error, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class GqlRefreshTokenAuthGuard extends GqlGuard(RefreshTokenAuthGuard) {}
