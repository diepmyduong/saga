import { Module } from "@nestjs/common";
import { ApiApplicationModule } from "./application";

const SubModules = [ApiApplicationModule];

@Module({
  imports: [...SubModules],
  exports: [...SubModules],
})
export class ApiFeatureModule {}
