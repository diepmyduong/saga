import { Inject } from "@nestjs/common";
import { Model } from "mongoose";

import { ModelProviderFactory } from "../../../database";
import { BaseRepository } from "../../repository.base";
import { MigrationDbModel, MigrationEntity } from "./migration.entity";
import { MigrationSchema } from "./migration.schema";

const MIGRATION_MODEL = "MIGRATION_MODEL";

export const MigrationModelProvider = ModelProviderFactory.createModelProvider(
  MIGRATION_MODEL,
  "Migration",
  MigrationSchema
);

export class MigrationRepository extends BaseRepository<MigrationDbModel, MigrationEntity> {
  constructor(
    @Inject(MIGRATION_MODEL)
    private migrationModel: Model<MigrationDbModel>
  ) {
    super(migrationModel, MigrationEntity);
  }
}
