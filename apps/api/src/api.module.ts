import { Module } from "@nestjs/common";
import { GuardProviders, ImportModules, InterceptProviders } from "./api.config";
import { ApiCoreModule } from "./core";
import { ApiFeatureModule } from "./features";

@Module({
  imports: [...ImportModules, ApiCoreModule, ApiFeatureModule],
  providers: [...GuardProviders, ...InterceptProviders],
})
export class ApiModule {}
