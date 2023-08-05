import { UserRepository } from "@app/dal";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cache } from "cache-manager";
import crypto from "crypto";
import { JwtPayload } from "../types";

@Injectable()
export class UserScopeService {
  private logger = new Logger(UserScopeService.name);
  constructor(private readonly userRepo: UserRepository, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  // get scope from jwt payload
  async getScope(user: JwtPayload): Promise<string[]> {
    if (!user.scopeHash) {
      return [];
    }
    // get scope from cache
    const cacheKey = `scope:${user.scopeHash}`;
    const scope = await this.cacheManager.get<string[]>(cacheKey);
    if (scope) {
      return scope;
    }
    // get scope from db
    const userEntity = await this.userRepo.findById(user.userId, "scopes");
    if (!userEntity) {
      return [];
    }
    const scopeFromDb = userEntity.scopes || [];

    this.logger.debug(`Get scope from db: ${scopeFromDb}`);
    const scopeHash = this.hashScope(scopeFromDb);
    // set scope to cache
    const ttl = 60000 * 24; // 1 day
    await this.cacheManager.set(cacheKey, scopeFromDb, ttl);
    // make sure scope hash is same and scope not changed
    if (scopeHash !== user.scopeHash) {
      return [];
    }
    // return scope
    return scopeFromDb;
  }

  // hash scope
  hashScope(scope: string[]): string {
    // sort scope
    scope.sort();
    // hash scope
    const scopeText = scope.join(",");
    const scopeHash = crypto.createHash("sha256").update(scopeText).digest("hex");
    return scopeHash;
  }
}
