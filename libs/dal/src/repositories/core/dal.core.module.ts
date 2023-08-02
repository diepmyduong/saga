import { Module } from "@nestjs/common";
import { ApplicationModule } from "./application";
import { MigrationModule } from "./migration";
import { SettingModule } from "./setting";
import { UserModule } from "./user";

const SubModules = [MigrationModule, SettingModule, UserModule, ApplicationModule];

@Module({
  imports: [...SubModules],
  exports: [...SubModules],
})
export class DalCoreModule {}
