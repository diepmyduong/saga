import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLES_META } from "../decorators";
import { GqlGuard } from "./common";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_META, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const req = this.getRequest(context);
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const isHasRole = requiredRoles.some((role) => user.role === role);

    if (!isHasRole) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

@Injectable()
export class GqlRolesGuard extends GqlGuard(RolesGuard) {}
