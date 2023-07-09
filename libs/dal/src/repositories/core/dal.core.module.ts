import { Module } from "@nestjs/common";
import { MigrationModule } from "./migration";
import { SettingModule } from "./setting";
import { UserModule } from "./user";

const SubModules = [MigrationModule, SettingModule, UserModule];

@Module({
  imports: [...SubModules],
  exports: [...SubModules],
})
export class DalCoreModule {}
