import { Inject, InternalServerErrorException } from "@nestjs/common";
import { Model } from "mongoose";

import { ModelProviderFactory } from "@app/dal/database";
import { Cacheable } from "@app/shared";
import { BaseRepository } from "../../repository.base";
import { SettingDbModel, SettingEntity } from "./setting.entity";
import { SettingSchema } from "./setting.schema";

const SETTING_MODEL = "SETTING_MODEL";

export const SettingModelProvider = ModelProviderFactory.createModelProvider(SETTING_MODEL, "Setting", SettingSchema);

export class SettingRepository extends BaseRepository<SettingDbModel, SettingEntity> {
  constructor(
    @Inject(SETTING_MODEL)
    private settingModel: Model<SettingDbModel>
  ) {
    super(settingModel, SettingEntity);
  }

  // load setting by key
  @Cacheable(10)
  async loadByKey<T>(key: string) {
    const setting = await this.findOne({ key });
    if (!setting) {
      throw new InternalServerErrorException(`Setting ${key} is not configured`);
    }
    return setting.value as T;
  }
}
