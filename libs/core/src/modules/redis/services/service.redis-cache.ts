import { Injectable } from "@nestjs/common";
import { Cluster, Redis } from "ioredis";
import { RedisClientService } from "./service.redis-client";

@Injectable()
export class RedisCacheService {
  constructor(private readonly redisClientService: RedisClientService) {}

  get client(): Redis | Cluster {
    return this.redisClientService.getClient();
  }

  // get value by key
  async get(key: string) {
    return await this.client.get(key);
  }

  // set value by key
  async set(key: string, value: any, ttl?: number) {
    if (ttl) {
      return await this.client.set(key, value, "EX", ttl);
    } else {
      return await this.client.set(key, value);
    }
  }

  // delete value by key
  async del(key: string) {
    return await this.client.del(key);
  }

  // check if key exists
  async exists(key: string) {
    return await this.client.exists(key);
  }

  // get all keys
  async keys(pattern: string) {
    return await this.client.keys(pattern);
  }

  // delete keys by pattern
  async delByPattern(pattern: string) {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      return await this.client.del(...keys);
    }
  }

  // set hmset
  async hmset(key: string, value: any) {
    return await this.client.hmset(key, value);
  }

  // get hmget
  async hmget(key: string, field: string) {
    return await this.client.hmget(key, field);
  }
}
