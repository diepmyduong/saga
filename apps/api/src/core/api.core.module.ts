import { Module } from "@nestjs/common";
import { ApiAuthModule } from "./auth";
import { ApiCatalogModule } from "./catalog";
import { ApiUserOwnModule } from "./user-own";

const SubModules = [ApiAuthModule, ApiCatalogModule, ApiUserOwnModule];

@Module({
  imports: [...SubModules],
  exports: [...SubModules],
})
export class ApiCoreModule {}
