import {
  AuthModule,
  GqlJwtAuthGuard,
  GqlPolicyGuard,
  GqlThrottlerGuard,
  LoggingInterceptor,
  MemoryManagerModule,
} from "@app/core";
import { DalModule } from "@app/dal/dal.module";
import { GRAPHQL_CONFIG, MEMORY_CONFIG, RATE_LIMIT_CONFIG } from "@app/shared";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { ThrottlerModule } from "@nestjs/throttler";
import { Request, Response } from "express";

export const ImportModules = [
  // Config GraphQL Module
  GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    playground: GRAPHQL_CONFIG.playground ? { settings: { "request.credentials": "include" } } : false,
    path: GRAPHQL_CONFIG.path,
    sortSchema: false,
    autoSchemaFile: "schema.gql",
    buildSchemaOptions: { dateScalarMode: "isoDate" },
    context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
    includeStacktraceInErrorResponses: false,
  }),

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
