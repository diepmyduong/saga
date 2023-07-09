import { RABBITMQ_CONFIG } from "@app/shared";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, InternalServerErrorException, Logger, OnApplicationShutdown } from "@nestjs/common";
import AMQPLib, { Channel, ChannelWrapper, Options } from "amqp-connection-manager";
import { IAmqpConnectionManager } from "amqp-connection-manager/dist/esm/AmqpConnectionManager";
import { Cache } from "cache-manager";
import { randomUUID } from "crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import _ from "lodash";
import { IQueuePayload, IQueuePublishOptions, IQueueService } from "./queue.interface";

const REQUEUE_MAX_ATTEMPTS_HEADER = "x-max-attempts";
const QUEUE_MESSAGE_PERSISTENCE_FILE = "queue-messages.json";

@Injectable()
export class QueueService implements IQueueService, OnApplicationShutdown {
  private logger = new Logger(this.constructor.name);
  private _connection: IAmqpConnectionManager;
  private _publishChannel: ChannelWrapper;
  private _consumeChannelMap: Record<string, ChannelWrapper> = {};
  private _replyToQueue: string;
  private _replyPromiseMap: Record<
    string,
    {
      resolve: (value?: any) => void;
      reject: (reason?: any) => void;
    }
  > = {};

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  public get connection() {
    return this._connection;
  }

  get isConnected() {
    return this._connection.isConnected();
  }

  // handle service graceful shutdown
  async onApplicationShutdown() {
    this.logger.log(`Shutting down queue service`);
    this.savePendingMessages();
  }

  private savePendingMessages() {
    if (!this._publishChannel) return; // skip if not connected
    this.logger.debug(`Saving pending messages. Queue length: ${this._publishChannel.queueLength()}`);
    if (this._publishChannel.queueLength() > 0) {
      // TODO: get all messages from local queue
      const messages = _.get(this._publishChannel, "_messages", []);
      // transform message content to string
      const transformed = messages.map((m: any) => ({
        ...m,
        content: m.content.toString(),
      }));
      // TODO: persist to tmp file
      writeFileSync(QUEUE_MESSAGE_PERSISTENCE_FILE, JSON.stringify(transformed));
    }
  }

  private async loadPersistedMessages(channel: ChannelWrapper) {
    if (existsSync(QUEUE_MESSAGE_PERSISTENCE_FILE)) {
      const messages = JSON.parse(readFileSync(QUEUE_MESSAGE_PERSISTENCE_FILE, { encoding: "utf8" }));
      // requeue all messages
      for (const m of messages) {
        if (m.type === "sendToQueue") {
          this._publishChannel.sendToQueue(m.queue, Buffer.from(m.content), m.options);
        }
      }
      // remove file
      unlinkSync(QUEUE_MESSAGE_PERSISTENCE_FILE);

      this.logger.log(`Loaded persisted ${messages.length} messages`);
    }
  }

  async connect() {
    try {
      // connect to rabbitmq
      await this.connectRabbitMQ();
    } catch (err) {
      this.logger.error(`RabbitMQ connection Error`, err);
      throw new InternalServerErrorException(`RabbitMQ connection Error`, {
        cause: err,
      });
    }
  }

  async disconnect() {
    // grace fully close connection to rabbitmq
    // close publish channel
    if (this._publishChannel) {
      await this._publishChannel.close();
      // remove all listeners
      this._publishChannel.removeAllListeners();
    }
    // close connection
    if (this._connection) {
      await this._connection.close();
    }
  }
  // Connect to rabbitmq
  async connectRabbitMQ() {
    // create connection to rabbitmq
    const connection = await AMQPLib.connect(RABBITMQ_CONFIG.uri);

    // handle connection events
    this.handleConnectionEvents(connection);

    this._connection = connection;

    // assert publish channel
    const publishChannel = await connection.createChannel();
    this._publishChannel = publishChannel;

    // load persisted messages
    this.loadPersistedMessages(this._publishChannel);

    // set piblish channel
    publishChannel.addSetup(async (channel: Channel) => {
      this.logger.log(`Setting up publish channel`);
      // assert reply queue
      this._replyToQueue = `reply_to_${process.pid.toString()}`;
      await channel.assertQueue(this._replyToQueue, {
        exclusive: true, // delete queue when connection is closed
      });

      // consume reply queue
      await channel.consume(
        this._replyToQueue,
        (msg) => {
          if (msg) {
            const { correlationId } = msg.properties;
            // get promise from reply promise map
            const promise = this._replyPromiseMap[correlationId];
            if (promise) {
              try {
                const replyResult = JSON.parse(msg.content.toString());
                if (replyResult.success && replyResult.data) {
                  promise.resolve(replyResult.data);
                } else {
                  promise.reject(replyResult.error);
                }
              } catch (err) {
                promise.reject(err);
              }
            }
          }
        },
        {
          noAck: true, // without ack, message will be deleted from queue after consumed
        }
      );
    });
  }

  // Handle connection events
  handleConnectionEvents(connection: IAmqpConnectionManager) {
    connection.on("connect", () => {
      this.logger.log("RabbitMQ connected");
    });

    connection.on("connectFailed", ({ err, url }) => {
      this.logger.error("RabbitMQ connection failed: " + url, err);
    });

    connection.on("disconnect", ({ err }) => {
      this.logger.error("RabbitMQ disconnected", err);
    });

    connection.on("blocked", ({ reason }) => {
      this.logger.warn("RabbitMQ connection blocked", reason);
    });

    connection.on("unblocked", () => {
      this.logger.log("RabbitMQ connection unblocked");
    });
  }

  serializePayload(payload: any): Buffer {
    return Buffer.from(
      JSON.stringify({
        data: payload,
        iat: Date.now(),
      })
    );
  }

  // Reduce queue options
  reduceQueueOptions(options: IQueuePublishOptions): Options.Publish {
    const { persistent, attempts, ...rest } = options;
    const queueOptions: Options.Publish = {
      ...rest,
      persistent: persistent ?? true,
    };

    // add attempts header
    if (attempts) {
      queueOptions.headers = {
        ...queueOptions.headers,
        [REQUEUE_MAX_ATTEMPTS_HEADER]: attempts,
      };
    }

    if (!queueOptions.messageId) {
      queueOptions.messageId = randomUUID();
    }

    return queueOptions;
  }

  // Emit message to queue
  async emit(queue: string, payload: any, options: IQueuePublishOptions = { persistent: true }): Promise<void> {
    // check if connection is closed
    if (!this.isConnected) {
      throw new InternalServerErrorException("RabbitMQ connection closed");
    }

    const channel = this._publishChannel;

    // assert queue
    await channel.assertQueue(queue, { durable: true });

    // serialize payload
    const msg = this.serializePayload(payload);

    const queueOptions = this.reduceQueueOptions(options);

    // send message to queue
    channel.sendToQueue(queue, msg, queueOptions);
  }

  // Send command to queue and wait for reply
  async command<T>(queue: string, payload: any, options: IQueuePublishOptions = { persistent: true }): Promise<T> {
    // check if connection is closed
    if (!this.isConnected) {
      throw new InternalServerErrorException("RabbitMQ connection closed");
    }

    const channel = this._publishChannel;

    // assert queue
    await channel.assertQueue(queue, { durable: true });

    // create correlation id
    const correlationId = Math.random().toString() + Date.now().toString();

    // serialize payload
    const msg = this.serializePayload(payload);

    // create promise
    const promise = new Promise<T>((resolve, reject) => {
      // add promise to reply promise map
      this._replyPromiseMap[correlationId] = { resolve, reject };
    });

    // reduce queue options
    const queueOptions = this.reduceQueueOptions(options);

    // send message to queue
    channel.sendToQueue(queue, msg, {
      correlationId: correlationId,
      replyTo: this._replyToQueue,
      ...queueOptions,
    });

    // return promise
    return promise;
  }

  // Consume message from queue
  async consume(
    queue: string,
    handler: (payload: IQueuePayload) => Promise<void>,
    options: Options.Consume & { prefetch?: number } = {
      noAck: false,
    }
  ): Promise<void> {
    const { prefetch = 30, ...consumeOptions } = options;
    const channelWrapper = await this.getQueueChannel(queue);

    // add channel setup to wrapper
    channelWrapper.addSetup(async (channel: Channel) => {
      this.logger.log(`Setting up consume channel for queue ${queue}`);
      // set prefetch
      await channel.prefetch(prefetch);

      // assert queue
      await channel.assertQueue(queue, { durable: true });

      // consume message from queue
      await channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              // parse payload
              const payload: IQueuePayload = JSON.parse(msg.content.toString());
              // handle message
              const result = await handler(payload);

              // if msg need to reply, reply to queue
              if (msg.properties.replyTo) {
                // serialize result
                const resultMsg = Buffer.from(
                  JSON.stringify({
                    success: true,
                    data: result,
                  })
                );
                // send result to reply queue
                channel.sendToQueue(msg.properties.replyTo, resultMsg, {
                  correlationId: msg.properties.correlationId,
                });
              }

              // ack message
              channel.ack(msg);
            } catch (err) {
              this.logger.error(`Consume Queue ${queue} error`, err);

              // check message header for attempts
              const maxAttempts = msg.properties.headers[REQUEUE_MAX_ATTEMPTS_HEADER];

              const currentAttempts =
                (await this.cacheManager.get<number>(`requeue-attempts:` + msg.properties.messageId)) || 0;

              // if max attempts reached, nack message
              if (maxAttempts && currentAttempts < maxAttempts) {
                this.logger.debug(`Requeue message with attempts: ${currentAttempts}`);
                // requeue message
                // increase attempts
                this.cacheManager.set(
                  `requeue-attempts:` + msg.properties.messageId,
                  currentAttempts + 1,
                  60000 * 15 // 15 minute
                );

                channel.nack(msg, false, true);
              } else {
                // if msg need to reply, reply to queue
                // serialize result
                const resultMsg = Buffer.from(
                  JSON.stringify({
                    success: false,
                    error: err,
                  })
                );
                // send result to reply queue
                channel.sendToQueue(msg.properties.replyTo, resultMsg, {
                  correlationId: msg.properties.correlationId,
                });

                // nack message
                channel.nack(msg, false, false);

                // delete attempts
                this.cacheManager.del(`requeue-attempts:` + msg.properties.messageId);
              }
            }
          }
        },
        {
          ...consumeOptions,
          noAck: false,
        }
      );
    });
  }

  // Get queue consume channel
  private async getQueueChannel(queue: string): Promise<ChannelWrapper> {
    // if channel exists in consume channel map, return it
    if (this._consumeChannelMap[queue]) {
      return this._consumeChannelMap[queue];
    }
    const channel = await this._connection.createChannel();

    // set channel to consume channel map
    this._consumeChannelMap[queue] = channel;

    return channel;
  }
}
