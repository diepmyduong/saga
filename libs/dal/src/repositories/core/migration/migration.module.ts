import { Module } from "@nestjs/common";
import { MigrationModelProvider, MigrationRepository } from "./migration.repository";

@Module({
  providers: [MigrationModelProvider, MigrationRepository],
  exports: [MigrationModelProvider, MigrationRepository],
})
export class MigrationModule {}
