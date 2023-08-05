import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ApiAuthResolver } from "./api.auth.resolver";

@Module({
  imports: [CqrsModule],
  providers: [ApiAuthResolver],
  exports: [],
})
export class ApiAuthModule {}
