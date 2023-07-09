import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { EventEmitter } from "eventemitter3";
import v8 from "v8";

export interface IMemoryManagerOptions {
  debug: boolean;
  interval: number;
  warningThreshold: number;
  errorThreshold: number;
}

@Injectable()
export class MemoryManagerService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(MemoryManagerService.name);
  private _interval: NodeJS.Timeout;
  private eventEmitter = new EventEmitter();

  constructor(@Inject("MemoryManagerOptions") private readonly options: IMemoryManagerOptions) {}

  async onModuleInit() {
    // start memory listener
    await this.start();
  }

  async onModuleDestroy() {
    // clear interval if exists
    if (this._interval) {
      clearInterval(this._interval);
    }
  }

  async start() {
    // clear interval if exists
    if (this._interval) {
      clearInterval(this._interval);
    }

    // start interval
    this._interval = setInterval(() => {
      /** V8 Heap Stats */
      const heapStats = v8.getHeapStatistics();
      const heapTotal = heapStats.heap_size_limit;
      const heapUsed = heapStats.total_heap_size;
      const heapUsedPercentage = heapUsed / heapTotal;

      // this.addStats();

      const v8HeapUsage = {
        total: this._formatMemoryUsage(heapTotal),
        used: this._formatMemoryUsage(heapUsed),
        usedPercentage: `${Math.round(heapUsedPercentage * 100)}%`,
      };

      const message = `${v8HeapUsage.usedPercentage} (${v8HeapUsage.used} / ${v8HeapUsage.total})`;

      if (heapUsedPercentage > this.options.errorThreshold) {
        this.logger.error("Memory usage is too high: " + message);
        this.eventEmitter.emit("error", heapUsedPercentage);
        // MemoryManager.generateHeapdump();
      } else if (heapUsedPercentage > this.options.warningThreshold) {
        this.logger.warn("Memory usage is too high: " + message);
        this.eventEmitter.emit("warning", heapUsedPercentage);
      } else {
        if (this.options.debug) {
          this.logger.debug("Memory usage is ok: " + message);
        }
        this.eventEmitter.emit("ok", heapUsedPercentage);
      }
    }, this.options.interval);
  }

  // format memory usage
  private _formatMemoryUsage = (data: number) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
}
