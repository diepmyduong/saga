import { DynamicModule, Module } from "@nestjs/common";
import { DalCoreModule } from "./core/dal.core.module";

const SubModules = [DalCoreModule];

@Module({
  imports: [...SubModules],
  exports: [...SubModules],
})
export class RepositoriesModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: RepositoriesModule,
    };
  }
}
