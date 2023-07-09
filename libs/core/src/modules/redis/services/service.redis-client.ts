import { REDIS_CONFIG } from "@app/shared";
import { Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis, { Cluster } from "ioredis";

export class RedisClientService implements OnModuleInit, OnModuleDestroy {
  private instance: Redis | Cluster;
  private logger = new Logger(RedisClientService.name);
  private _isConnected = false;
  private _clonedClients: Map<string, Redis | Cluster> = new Map();

  async onModuleInit() {
    // connect to redis
    await this.connect();
  }

  async onModuleDestroy() {
    // handle graceful shutdown
    await this.disconnect();
  }

  // get connected status
  get isConnected() {
    return this._isConnected;
  }

  // connect to redis
  private async connect() {
    let redis: Redis | Cluster;

    switch (REDIS_CONFIG.backend) {
      // create redis cluster client
      case "cluster": {
        const nodes = this.getRedisNodes();
        redis = new Cluster(nodes, {
          lazyConnect: false,
          redisOptions: {
            password: REDIS_CONFIG.password,
            keyPrefix: REDIS_CONFIG.prefix,
          },
        });
        this.logger.log(`Creating redis cluster client. Nodes: ${nodes}`);
        break;
      }

      case "sentinel": {
        const nodes = this.getRedisNodes();
        const masterName = REDIS_CONFIG.sentinel.master;
        redis = new Redis({
          sentinels: nodes,
          name: masterName,
          keyPrefix: REDIS_CONFIG.prefix,
          password: REDIS_CONFIG.password,
          lazyConnect: false,
          sentinelUsername: REDIS_CONFIG.sentinel.username,
          sentinelPassword: REDIS_CONFIG.sentinel.password,
        });
        this.logger.log(`Creating redis sentinel client ${masterName}`);
        break;
      }
      case "single":
      default:
        redis = new Redis({
          host: REDIS_CONFIG.host,
          port: REDIS_CONFIG.port,
          password: REDIS_CONFIG.password,
          keyPrefix: REDIS_CONFIG.prefix,
          lazyConnect: false,
        });
        this.logger.log(`Creating redis client ${REDIS_CONFIG.host}`);
    }

    // handle redis events
    await this.handleRedisEvents(redis);

    this.instance = redis;

    return redis;
  }

  // disconnect from redis
  private async disconnect() {
    // disconnect redis client
    if (this.instance) {
      await this.instance.disconnect();

      // handle redis events
      this.instance.removeAllListeners();
    }
  }

  // handle redis events
  private async handleRedisEvents(redis: Redis | Cluster) {
    redis.on("connect", () => {
      this.logger.log("Redis connecting...");
    });
    redis.on("ready", () => {
      this.logger.log("Redis ready");
      this._isConnected = true;
    });
    redis.on("error", (err) => {
      this.logger.error("Redis error: " + err.message);
    });
    redis.on("close", () => {
      this.logger.log("Redis closed");
      this._isConnected = false;
    });
    redis.on("reconnecting", () => {
      this.logger.log("Redis reconnecting...");
    });
    redis.on("end", () => {
      this.logger.log("Redis end");
      this._isConnected = false;
    });
    if (REDIS_CONFIG.backend == "sentinel") {
      redis.on("sentinelError", (err) => {
        this.logger.error("Redis sentinel error: " + err.message);
      });
    }
  }

  // get redis cluster nodes from config
  private getRedisNodes = () => {
    const configNodes = REDIS_CONFIG.nodes;

    if (configNodes.length == 0) {
      throw new Error("Chưa config redis nodes");
    }

    // split nodes and map to array of objects {host, port}
    const nodes = configNodes
      .map((path) => new URL("redis://" + path))
      .map((url) => ({
        host: url.hostname,
        port: Number(url.port == "" ? "80" : url.port),
      }));

    return nodes;
  };

  // get redis client
  getClient() {
    return this.instance;
  }

  // clone redis client
  cloneClient(appId: string) {
    if (this._clonedClients.has(appId)) {
      return this._clonedClients.get(appId);
    }
    const client = this.instance.duplicate();
    this._clonedClients.set(appId, client);
    return client;
  }
}
