import { UserModule } from "@app/dal";
import { JWT_CONFIG } from "@app/shared";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CaslAbilityFactory } from "./casl";
import { CoreAuthService } from "./core.auth.service";

import { LoginUserHandler, LogoutUserCommand, RefreshUserTokenHandler } from "./commands";
import { AdminUserService } from "./services";
import { StaticPolicyAdapter } from "./services/static-policy.service";
import { UserScopeService } from "./services/user-scope.service";
import { JwtStrategy, PolicyAbilityStrategy } from "./strategies";

const CommandHandlers = [LoginUserHandler, RefreshUserTokenHandler, LogoutUserCommand];

@Module({
  imports: [
    CacheModule.register(),
    UserModule,
    JwtModule.register({
      secret: JWT_CONFIG.secret,
      signOptions: { expiresIn: JWT_CONFIG.signExpiresIn },
    }),
  ],
  providers: [
    CaslAbilityFactory,
    JwtStrategy,
    PolicyAbilityStrategy,
    StaticPolicyAdapter,
    CoreAuthService,
    AdminUserService,
    UserScopeService,
    ...CommandHandlers,
  ],
  exports: [CoreAuthService, CaslAbilityFactory],
})
export class AuthModule {
  static forRoot() {
    return {
      module: AuthModule,
      global: true,
    };
  }
}
