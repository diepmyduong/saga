import { UserModule } from "@app/dal";
import { JWT_CONFIG } from "@app/shared";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CaslAbilityFactory } from "./casl";
import { CoreAuthService } from "./core.auth.service";
import { AuthScopeModule } from "./modules";
import { AdminUserService } from "./services";
import { StaticPolicyAdapter } from "./services/service.static-policy";
import { JwtStrategy, PolicyAbilityStrategy, RefreshTokenStrategy } from "./strategies";

@Module({
  imports: [
    CacheModule.register(),
    AuthScopeModule,
    UserModule,
    JwtModule.register({
      secret: JWT_CONFIG.secret,
      signOptions: { expiresIn: JWT_CONFIG.signExpiresIn },
    }),
  ],
  providers: [
    CaslAbilityFactory,
    JwtStrategy,
    RefreshTokenStrategy,
    PolicyAbilityStrategy,
    StaticPolicyAdapter,
    CoreAuthService,
    AdminUserService,
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
