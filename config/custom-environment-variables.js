const _number = (name) => ({ __name: name, __format: "number" });
const _boolean = (name) => ({ __name: name, __format: "boolean" });
const _json = (name) => ({ __name: name, __format: "json" });

module.exports = {
  tz: "TZ",
  passport: {
    session: _boolean("PASSPORT_SESSION"),
  },
  jwt: {
    secret: "JWT_SECRET",
    signExpiresIn: "JWT_SIGN_EXPIRES_IN",
    refreshExpiresIn: "JWT_REFRESH_EXPIRES_IN",
  },
  graphql: {
    playground: _boolean("GRAPHQL_PLAYGROUND"),
    debug: _boolean("GRAPHQL_DEBUG"),
    path: "GRAPHQL_PATH",
  },
  sentry: {
    enabled: _boolean("SENTRY_ENABLED"),
    dsn: "SENTRY_DSN",
  },
  rateLimit: {
    ttl: _number("RATE_LIMIT_TTL"),
    limit: _number("RATE_LIMIT_LIMIT"),
    login: {
      ttl: _number("RATE_LIMIT_LOGIN_TTL"),
      limit: _number("RATE_LIMIT_LOGIN_LIMIT"),
    },
  },
  mongo: {
    uri: "MONGO_URI",
  },
  rabbitmq: {
    uri: "RABBITMQ_URI",
  },
  worker: {
    queue: {
      matcher: _json("WORKER_QUEUE_MATCHER"),
    },
  },
  auth: {
    admin: {
      username: "AUTH_ADMIN_USERNAME",
      email: "AUTH_ADMIN_EMAIL",
      password: "AUTH_ADMIN_PASSWORD",
    },
  },
  minio: {
    endpoint: "MINIO_ENDPOINT",
    port: _number("MINIO_PORT"),
    accessKey: "MINIO_ACCESS_KEY",
    secretKey: "MINIO_SECRET_KEY",
    bucket: "MINIO_BUCKET",
  },
  redis: {
    host: "REDIS_HOST",
    port: _number("REDIS_PORT"),
    password: "REDIS_PASS",
    prefix: "REDIS_PREFIX",
    backend: "REDIS_BACKEND", // single, cluster, sentinel
    nodes: _json("REDIS_NODES"),
    sentinel: {
      master: "REDIS_SENTINEL_MASTER",
      username: "REDIS_SENTINEL_USERNAME",
      password: "REDIS_SENTINEL_PASSWORD",
    },
  },
  memory: {
    debug: _boolean("MEMORY_DEBUG"),
    interval: _number("MEMORY_INTERVAL"),
    warningThreshold: _number("MEMORY_WARNING_THRESHOLD"),
    errorThreshold: _number("MEMORY_ERROR_THRESHOLD"),
  },
};
