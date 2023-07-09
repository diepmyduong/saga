import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database";
import { RepositoriesModule } from "./repositories";

@Module({
  imports: [DatabaseModule, RepositoriesModule],
  exports: [DatabaseModule, RepositoriesModule],
})
export class DalModule {
  static forRoot() {
    return {
      module: DalModule,
      global: true,
    };
  }
}
