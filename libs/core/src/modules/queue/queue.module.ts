import { CacheModule } from "@nestjs/cache-manager";
import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DiscoveryModule } from "../discovery";
import { QueueRunnerService } from "./queue-runner.service";
import { QueueService } from "./queue.service.";

@Module({
  imports: [CacheModule.register(), DiscoveryModule],
  providers: [QueueService, QueueRunnerService],
  exports: [QueueService],
})
export class QueueModule implements OnModuleInit, OnModuleDestroy {
  static forRoot() {
    return {
      module: QueueModule,
      global: true,
    };
  }

  constructor(private readonly queuService: QueueService, private readonly queueRunnerService: QueueRunnerService) {}

  async onModuleInit() {
    // start all queue consumers
    await this.queuService.connect();

    // start all queue consumers
    await this.queueRunnerService.run();
  }

  async onModuleDestroy() {
    await this.queuService.disconnect();
  }
}
