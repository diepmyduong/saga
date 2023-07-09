import { QueueModule } from "@app/core";
import { DalModule } from "@app/dal";
import { Module } from "@nestjs/common";
import { QueueModules } from "./queues";

@Module({
  imports: [
    // Enable Queue Module
    QueueModule.forRoot(),
    // Connect Tenant Database
    DalModule.forRoot(),

    // import queue modules
    ...QueueModules,
  ],
  providers: [],
})
export class WorkerModule {}
