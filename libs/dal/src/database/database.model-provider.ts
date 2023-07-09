import { Connection, Schema } from "mongoose";

export const DATABASE_CONNECTION_TOKEN = "DATABASE_CONNECTION";

export class ModelProviderFactory {
  static createModelProvider(
    provide: string,
    collection: string,
    schema: Schema,
    options?: {
      collection?: string;
      connection?: string;
    }
  ) {
    const connection = options?.connection || DATABASE_CONNECTION_TOKEN;
    return {
      provide: provide,
      inject: [connection],
      useFactory: (connection: Connection) => {
        return connection.models[collection] || connection.model(collection, schema, options?.collection);
      },
    };
  }
}
