import { DynamicModule, Module } from "@nestjs/common";
import { IMemoryManagerOptions, MemoryManagerService } from "./memory-manager.service";

@Module({
  imports: [],
  providers: [MemoryManagerService],
  exports: [MemoryManagerService],
})
export class MemoryManagerModule {
  static register(options?: IMemoryManagerOptions): DynamicModule {
    return {
      module: MemoryManagerModule,
      providers: [
        {
          provide: "MemoryManagerOptions",
          useValue:
            options ||
            ({
              debug: false,
              interval: 5000,
              warningThreshold: 0.8,
              errorThreshold: 0.9,
            } as IMemoryManagerOptions),
        },
      ],
    };
  }
}
