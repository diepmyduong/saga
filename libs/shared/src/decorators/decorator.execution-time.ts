import { Logger } from "@nestjs/common";

export function ExecutionTime(message: string, logLevel: "log" | "debug" = "debug") {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const end = Date.now();
        const executionTime = end - start;
        Logger[logLevel](`Call ${propertyKey}: ${message} - ${executionTime}ms`, this.constructor.name);
        return result;
      } catch (error) {
        const end = Date.now();
        const executionTime = end - start;
        Logger.error(
          `Call ${propertyKey} Error: ${error.message} - ${executionTime}ms`,
          error.stack,
          this.constructor.name
        );
        throw error;
      }
    };

    return descriptor;
  };
}
