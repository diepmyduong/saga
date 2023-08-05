import { JWT_CONFIG } from "@app/shared";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

const jwtModule = JwtModule.register({
  secret: JWT_CONFIG.secret,
  signOptions: { expiresIn: JWT_CONFIG.signExpiresIn },
});
@Module({
  imports: [jwtModule],
  exports: [jwtModule],
})
export class CoreJwtModule {}
