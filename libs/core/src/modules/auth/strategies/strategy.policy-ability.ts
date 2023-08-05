import { AbilityBuilder } from "@casl/ability";
import { ExecutionContext, Inject, Injectable } from "@nestjs/common";

import { ApplicationRepository } from "@app/dal";
import { AppUserStatus } from "@app/dal/repositories/core/application/application.interface";
import { PermissionException } from "@app/shared";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import _ from "lodash";
import { AppAbility, CaslBuildAbilityStrategy } from "../casl";
import { StaticPolicyAdapter } from "../services/static-policy.service";
import { UserScopeService } from "../services/user-scope.service";
import { JwtPayload } from "../types/auth.jwt.interface";

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
    private readonly authScopeService: UserScopeService,
    private appRepo: ApplicationRepository
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
    const req: any = this.getRequest(context);
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
    const user = _.get(req, "user", null) as JwtPayload;
    if (!user) return;

    if (user) {
      // config rule from user role
      await this.applyRole(user.role, can, cannot);

      if (user.scopeHash) {
        // config rule from user scope
        const scopes = await this.authScopeService.getScope(user);
        for (const scope of scopes) {
          await this.applyScope(scope, can, cannot);
        }
      }

      // config rule for app
      const appId = req.headers["x-app-id"];
      if (appId) {
        const app = await this.appRepo.load(appId.toString());
        if (!app) {
          throw new PermissionException();
        }
        // check user have permission in app
        const appUser = app.users.find((u) => u.userId && u.userId.toString() === user.userId);
        if (!appUser || appUser.status === AppUserStatus.BLOCKED) {
          throw new PermissionException();
        }
        // config rule for app
        await this.applyScope("app:" + appUser.role, can, cannot);
      }
    }
  }

  private async applyRole(role: string, can: any, cannot: any) {
    const policy = await this.policyService.getPolicy(role);
    policy.forEach((statement) => {
      if (statement.effect === "allow") {
        can(statement.actions, statement.resources);
      } else {
        cannot(statement.actions, statement.resources);
      }
    });
  }

  private async applyScope(scope: string, can: any, cannot: any) {
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
