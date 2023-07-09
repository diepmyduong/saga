import { DynamicModule, Module } from "@nestjs/common";

const SubModules: DynamicModule[] = [];

@Module({
  imports: [...SubModules],
  exports: [...SubModules],
})
export class ApiFeatureModule {}
