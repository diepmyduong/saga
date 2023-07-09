import { MONGO_CONFIG } from "@app/shared";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

import { DATABASE_CONNECTION_TOKEN } from "./database.model-provider";
import { DatabaseService } from "./database.service";

export const DatabaseProvider = {
  provide: DATABASE_CONNECTION_TOKEN,
  useFactory: async (databaseService: DatabaseService) => {
    const uri = MONGO_CONFIG.uri;
    const connection = databaseService.createConnection("default", uri);
    return connection;
  },
  inject: [DatabaseService],
};

export const DynamicDatabaseProvider = {
  provide: DATABASE_CONNECTION_TOKEN,
  useFactory: async (databaseService: DatabaseService, { req }: { req: Request }) => {
    const time = Date.now();
    // get tenant id from request
    const tenantId = getTenantIdFromRequest(req);

    // if no tenant id, throw error
    if (!tenantId) {
      throw new Error("No tenant id found");
    }
    if (!databaseService.hasConnection(tenantId)) {
      // create connection
      const connection = databaseService.createConnection(tenantId, MONGO_CONFIG.uri, {
        dbName: `tenant_${tenantId}`,
        appName: `tenant_${tenantId}`,
      });
      return connection;
    } else {
      return databaseService.getConnection(tenantId);
    }
  },
  inject: [DatabaseService, REQUEST],
};

function getTenantIdFromRequest(request: Request): string {
  // get tenant id from headers or cookies
  return request.headers["x-tenant-id"] || (request.cookies ? request.cookies["x-tenant-id"] : null);
}
