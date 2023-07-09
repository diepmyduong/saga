const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  domain: "http://localhost:3000",
  tz: "Asia/Ho_Chi_Minh",
  passport: {
    session: true,
  },
  jwt: {
    secret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    signExpiresIn: "1d",
    refreshExpiresIn: "7d",
  },
  graphql: {
    playground: true,
    debug: false,
    path: "/graphql",
  },
  sentry: {
    enabled: false,
    dsn: "",
  },
  rateLimit: {
    ttl: 60, // in 60 seconds
    limit: 100, // limit each IP to 100 requests per windowMs
    login: {
      ttl: 180, // in 180 seconds
      limit: 5, // limit each IP to 5 requests per windowMs
    },
  },
  mongo: {
    uri: null,
  },
  rabbitmq: {
    uri: null,
  },
  worker: {
    queue: {
      matcher: [],
    },
  },
  auth: {
    admin: {
      username: "admin",
      email: "admin@loyalty.vn",
      password: "changeme",
    },
  },
  minio: {
    endpoint: undefined,
    port: 443, // default port is 443 for secure connection
    useSSL: undefined,
    accessKey: undefined,
    secretKey: undefined,
  },
  redis: {
    host: "127.0.0.1",
    port: 6379,
    password: undefined,
    prefix: undefined,
    backend: "single", // "single" or "cluster or "sentinel"
    nodes: [],
    sentinel: {
      master: "mymaster",
      username: undefined,
      password: undefined,
    },
  },
  memory: {
    debug: false,
    interval: 5000,
    warningThreshold: 0.8,
    errorThreshold: 0.9,
  },
};
