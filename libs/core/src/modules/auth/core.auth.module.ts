import { UserModule } from "@app/dal";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { CaslAbilityFactory } from "./casl";
import { CoreAuthService } from "./core.auth.service";

import { LoginUserHandler, LogoutUserCommand, RefreshUserTokenHandler, RegisterUserHandler } from "./commands";
import { CoreJwtModule } from "./core.jwt.module";
import { AdminUserService } from "./services";
import { StaticPolicyAdapter } from "./services/static-policy.service";
import { UserScopeService } from "./services/user-scope.service";
import { JwtStrategy, PolicyAbilityStrategy } from "./strategies";

const CommandHandlers = [LoginUserHandler, RefreshUserTokenHandler, LogoutUserCommand, RegisterUserHandler];

@Module({
  imports: [CacheModule.register(), UserModule, CoreJwtModule],
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
