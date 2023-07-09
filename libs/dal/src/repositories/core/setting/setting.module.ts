import { Module } from "@nestjs/common";
import { SettingModelProvider, SettingRepository } from "./setting.repository";

@Module({
  providers: [SettingModelProvider, SettingRepository],
  exports: [SettingModelProvider, SettingRepository],
})
export class SettingModule {}
