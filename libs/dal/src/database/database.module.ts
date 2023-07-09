import { MONGO_CONFIG } from "@app/shared";
import { DynamicModule, InternalServerErrorException, Module } from "@nestjs/common";
import { DatabaseProvider } from "./database.provider";
import { DatabaseService } from "./database.service";

@Module({
  providers: [DatabaseService, DatabaseProvider],
  exports: [DatabaseService, DatabaseProvider],
})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: DatabaseModule,
    };
  }

  constructor() {
    // check mongo uri config
    if (!MONGO_CONFIG.uri) {
      throw new InternalServerErrorException("No database uri found");
    }
  }
}
