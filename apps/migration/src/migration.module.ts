import { Module } from "@nestjs/common";

import { DiscoveryModule } from "@app/core";
import { DalModule } from "@app/dal";
import { MigrationFactory } from "./migration.factory";
import { MigrationService } from "./migration.service";
import { MIGRATIONS } from "./migrations";

@Module({
  imports: [DalModule.forRoot(), DiscoveryModule],
  providers: [MigrationService, MigrationFactory, ...MIGRATIONS],
})
export class MigrationModule {}
