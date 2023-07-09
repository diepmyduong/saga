import { Injectable } from '@nestjs/common';
import mongoose, { ConnectOptions, Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  private connections: Map<string, Connection>;
  private baseOptions: ConnectOptions = {
    autoIndex: true,
    autoCreate: true,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  };

  constructor() {
    this.connections = new Map<string, Connection>();
  }

  createConnection(
    tenantId: string,
    uri: string,
    options: ConnectOptions = {},
  ): Connection {
    if (!this.connections.has(tenantId)) {
      const connection: Connection = mongoose.createConnection(
        uri,
        Object.assign({}, this.baseOptions, options),
      );
      this.connections.set(tenantId, connection);
    }

    return this.connections.get(tenantId)!;
  }

  hasConnection(tenantId: string): boolean {
    return this.connections.has(tenantId);
  }

  getConnection(tenantId: string): Connection {
    return this.connections.get(tenantId)!;
  }
}
