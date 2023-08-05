import { JWT_CONFIG } from "@app/shared";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ApplicationModelProvider, ApplicationRepository } from "./application.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_CONFIG.secret,
      signOptions: { expiresIn: JWT_CONFIG.signExpiresIn },
    }),
  ],
  providers: [ApplicationModelProvider, ApplicationRepository],
  exports: [ApplicationRepository],
})
export class ApplicationModule {}
