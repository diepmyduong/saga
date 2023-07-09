import { MigrationRepository, MigrationStatusEnum } from "@app/dal";
import { Inject, Injectable, Logger, OnModuleInit, Scope } from "@nestjs/common";
import { MigrationFactory } from "./migration.factory";

@Injectable({ scope: Scope.DEFAULT })
export class MigrationService implements OnModuleInit {
  @Inject() migrationRepo: MigrationRepository;
  @Inject() migrationFactory: MigrationFactory;

  private logger = new Logger(MigrationService.name);

  async onModuleInit() {
    this.logger.log("Executing migrations");
    // load all migrations
    await this.loadMigrations();
    this.logger.log("Migrations executed successfully");
    // close application after migrations
    process.exit(0);
  }

  // load all migrations
  async loadMigrations() {
    const migrations = await this.migrationFactory.extractProviders();

    try {
      // loop through all migrations & execute them
      for (const migration of migrations) {
        // check if migration is already executed
        const migrationEntity = await this.migrationRepo.findOne({ name: migration.key });
        if (migrationEntity) {
          // migration already executed
          continue;
        }

        const start = Date.now();
        this.logger.log(`Executing migration ${migration.key}`);
        // execute migration
        await migration.provider.up();

        const end = Date.now();
        const duration = end - start;
        this.logger.log(`Migration ${migration.key} executed successfully - ${duration}ms`);

        if (migration.debug === false) {
          // create migration entity
          await this.migrationRepo.create({
            name: migration.key,
            status: MigrationStatusEnum.SUCCESS,
            createdAt: new Date(),
          });
        }
      }
    } catch (err) {
      this.logger.error(`Error while executing migrations: ${err.message}`, err.stack);
      throw err;
    }
  }
}
