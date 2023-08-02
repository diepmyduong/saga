import {
  AuthModule,
  GqlJwtAuthGuard,
  GqlPolicyGuard,
  GqlThrottlerGuard,
  LoggingInterceptor,
  MemoryManagerModule,
} from "@app/core";
import { DalModule } from "@app/dal/dal.module";
import { MEMORY_CONFIG, RATE_LIMIT_CONFIG } from "@app/shared";
import { ThrottlerModule } from "@nestjs/throttler";
import { ApiGraphqlModule } from "./shared";

export const ImportModules = [
  // Config GraphQL Module
  ApiGraphqlModule,

  // Connect Tenant Database
  DalModule.forRoot(),

  // Enable Global Auth
  AuthModule.forRoot(),

  // Enable Throttler
  ThrottlerModule.forRoot({ ttl: RATE_LIMIT_CONFIG.ttl, limit: RATE_LIMIT_CONFIG.limit }),

  // Enable Memory Manager
  MemoryManagerModule.register(MEMORY_CONFIG),
];

export const GuardProviders = [
  // Enable Global Guard
  { provide: "APP_GUARD", useClass: GqlJwtAuthGuard },
  { provide: "APP_GUARD", useClass: GqlPolicyGuard },
  { provide: "APP_GUARD", useClass: GqlThrottlerGuard },
];

export const InterceptProviders = [
  // Logging Api Request
  { provide: "APP_INTERCEPTOR", useClass: LoggingInterceptor },
];
