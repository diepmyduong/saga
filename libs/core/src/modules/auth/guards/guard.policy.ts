import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { PermissionException } from "@app/shared";
import { RESOURCE_META } from "../decorators";

import { CaslAbilityFactory } from "../casl/casl.ability.factory";
import { PolicyAbilityStrategy } from "../strategies";
import { GqlGuard } from "./common";

@Injectable()
export class PoliciesGuard implements CanActivate {
  private readonly logger = new Logger(PoliciesGuard.name);

  constructor(private reflector: Reflector, private caslAbilityFactory: CaslAbilityFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceMeta = this.reflector.getAllAndOverride(RESOURCE_META, [context.getClass(), context.getHandler()]);
    if (!resourceMeta) return true;

    const req = this.getRequest(context);
    const { user } = req;
    if (!user) throw new UnauthorizedException();

    const ability = await this.caslAbilityFactory.createByStrategy(PolicyAbilityStrategy, context);

    const canAccess = ability.can(context.getHandler().name, resourceMeta.resource);
    if (!canAccess) {
      throw new PermissionException();
    }

    // set ability to request
    req.ability = ability;
    return true;
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}

@Injectable()
export class GqlPolicyGuard extends GqlGuard(PoliciesGuard) {}
