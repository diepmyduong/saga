import config from "config";

export const DOMAIN = config.get<string>("domain");

export const TIMEZONE = config.get<string>("tz");

export const PASSPORT_CONFIG = config.get<{
  secret: string;
}>("passport");

export const JWT_CONFIG = config.get<{
  secret: string;
  signExpiresIn: string;
  refreshExpiresIn: string;
}>("jwt");

export const GRAPHQL_CONFIG = config.get<{
  debug: boolean;
  playground: boolean;
  path: string;
}>("graphql");

export const SENTRY_CONFIG = config.get<{
  enabled: boolean;
  dsn: string;
}>("sentry");

export const RATE_LIMIT_CONFIG = config.get<{
  ttl: number;
  limit: number;
  login: {
    ttl: number;
    limit: number;
  };
}>("rateLimit");

export const MONGO_CONFIG = config.get<{
  uri: string;
}>("mongo");

export const RABBITMQ_CONFIG = config.get<{
  uri: string;
}>("rabbitmq");

export const WORKER_CONFIG = config.get<{
  queue: {
    matcher: string[];
  };
}>("worker");

export const AUTH_CONFIG = config.get<{
  admin: {
    username: string;
    email: string;
    password: string;
  };
}>("auth");

export const MINIO_CONFIG = config.get<{
  endpoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  bucket: string;
}>("minio");

export const REDIS_CONFIG = config.get<{
  host: string;
  port: number;
  password: string;
  prefix: string;
  backend: "cluster" | "sentinel" | "single";
  nodes: string[];
  sentinel: {
    master: string;
    username: string;
    password: string;
  };
}>("redis");

export const MEMORY_CONFIG = config.get<{
  debug: boolean;
  interval: number;
  warningThreshold: number;
  errorThreshold: number;
}>("memory");
