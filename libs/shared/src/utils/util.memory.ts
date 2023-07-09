import { Logger } from '@nestjs/common';
import v8 from 'v8';

export class MemoryUtil {
  static logMemoryUsage(logger: Logger | Console) {
    const memoryData = process.memoryUsage();
    const formatMemoryUsage = (data: number) =>
      `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
    /** V8 Heap Stats */
    const heapStats = v8.getHeapStatistics();
    const heapTotal = heapStats.heap_size_limit;
    const heapUsed = heapStats.total_heap_size;
    const heapUsedPercentage = heapUsed / heapTotal;

    const v8HeapUsage = {
      total: formatMemoryUsage(heapTotal),
      used: formatMemoryUsage(heapUsed),
      usedPercentage: `${Math.round(heapUsedPercentage * 100)}%`,
    };
    logger.debug('Memory usage:', v8HeapUsage);
  }

  static getMemorySizeOf(obj: any) {
    this.formatByteSize(this.sizeOf(obj));
  }

  private static sizeOf(obj: any) {
    let bytes = 0;
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += obj.length * 2;
          break;
        case 'boolean':
          bytes += 4;
          break;
        case 'object':
          const objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === 'Object' || objClass === 'Array') {
            for (const key in obj) {
              if (!obj.hasOwnProperty(key)) continue;
              this.sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  }

  private static formatByteSize(bytes: number) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KiB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MiB';
    else return (bytes / 1073741824).toFixed(3) + ' GiB';
  }
}
