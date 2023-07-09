import Fastq from "fastq";

export const Sequence = (concurrency: number = 1): MethodDecorator => {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const queue = this.__queue;
      if (!queue) {
        // create queue
        this.__queue = Fastq.promise({}, (args) => originalMethod.apply(this, args), concurrency);
      }
      return this.__queue.push(args);
    };
    return descriptor;
  };
};
