import { LRUCacheMap } from "../utils";

export const Cacheable = (ttlSec: number): MethodDecorator => {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      if (!this.__cache) {
        // create cache
        this.__cache = LRUCacheMap({ maxItems: 1000, maxAge: ttlSec });
      }
      const cacheKey = `${key.toString()}-${JSON.stringify(args)}`;
      const cachedValue = await this.__cache.get(cacheKey);
      if (cachedValue) {
        return cachedValue;
      }
      const result = await originalMethod.apply(this, args);
      await this.__cache.set(cacheKey, result);
      return result;
    };

    return descriptor;
  };
};
