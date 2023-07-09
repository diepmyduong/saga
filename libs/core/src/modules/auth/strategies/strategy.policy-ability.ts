import { AbilityBuilder } from "@casl/ability";
import { ExecutionContext, Inject, Injectable } from "@nestjs/common";

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { JwtPayload } from "../base/auth.jwt.interface";
import { AppAbility, CaslBuildAbilityStrategy } from "../casl";
import { AuthScopeService } from "../modules/scope/auth.scope.service";
import { StaticPolicyAdapter } from "../services/service.static-policy";

export interface IPermission {
  effect: "allow" | "deny";
  actions: string[];
  resources: string[];
}

@Injectable()
export class PolicyAbilityStrategy extends CaslBuildAbilityStrategy {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    protected readonly policyService: StaticPolicyAdapter,
    private readonly authScopeService: AuthScopeService
  ) {
    super();
  }

  // try to get ability from cache
  async buildFromCache(context: ExecutionContext) {
    const cacheKey = this.cacheTrackBy(context);
    // get ability from cache first
    return this.cacheManager.get<AppAbility>(cacheKey);
  }

  // Set to cache after build ability
  setCache(ability: AppAbility, context: ExecutionContext): Promise<void> {
    const cacheKey = this.cacheTrackBy(context);
    return this.cacheManager.set(cacheKey, ability);
  }

  // Get cache key by user role
  cacheTrackBy(context: ExecutionContext): string {
    const req = this.getRequest(context);
    if (!req && !req.user) {
      return "";
    }
    const user: JwtPayload = req.user;
    let cacheKey = `ability:${user.role}`;
    if (user.scopeHash) {
      cacheKey += `:${user.scopeHash}`;
    }
    return cacheKey;
  }

  // Config rule for ability by user role and policy
  async configRule({ can, cannot }: AbilityBuilder<AppAbility>, context: ExecutionContext): Promise<void> {
    let req = this.getRequest(context);
    if (!req && !req.user) return;

    const user: JwtPayload = req.user;

    if (user) {
      // config rule from user role
      const policy = await this.policyService.getPolicy(user.role);
      policy.forEach((statement) => {
        if (statement.effect === "allow") {
          can(statement.actions, statement.resources);
        } else {
          cannot(statement.actions, statement.resources);
        }
      });

      if (user.scopeHash) {
        // config rule from user scope
        const scopes = await this.authScopeService.getScope(user);
        for (const scope of scopes) {
          const scopePolicy = await this.policyService.getPolicyByScope(scope);
          scopePolicy.forEach((statement) => {
            if (statement.effect === "allow") {
              can(statement.actions, statement.resources, statement.fields, statement.conditions);
            } else {
              cannot(statement.actions, statement.resources, statement.fields, statement.conditions);
            }
          });
        }
      }
    }
  }
}
