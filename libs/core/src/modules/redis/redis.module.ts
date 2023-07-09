import { Module } from "@nestjs/common";
import { RedisCacheService, RedisClientService } from "./services";

@Module({
  imports: [],
  providers: [RedisClientService, RedisCacheService],
  exports: [RedisClientService, RedisCacheService],
})
export class RedisModule {
  static forRoot() {
    return {
      module: RedisModule,
      global: true,
    };
  }
}
