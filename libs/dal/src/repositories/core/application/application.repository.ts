import { Inject } from "@nestjs/common";
import { Model } from "mongoose";

import { ModelProviderFactory } from "@app/dal/database";
import { BaseRepository } from "../../repository.base";
import { ApplicationDbModel, ApplicationEntity } from "./application.entity";
import { ApplicationSchema } from "./application.schema";

const MODE_TOKEN = "APPLICATION_MODEL";

export const ApplicationModelProvider = ModelProviderFactory.createModelProvider(
  MODE_TOKEN,
  "Application",
  ApplicationSchema
);

export class ApplicationRepository extends BaseRepository<ApplicationDbModel, ApplicationEntity> {
  constructor(@Inject(MODE_TOKEN) model: Model<ApplicationDbModel>) {
    super(model, ApplicationEntity);
  }
}
