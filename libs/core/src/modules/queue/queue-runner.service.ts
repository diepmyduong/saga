import { WORKER_CONFIG } from "@app/shared";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import Fastq from "fastq";
import _ from "lodash";
import { QueueService } from "./queue.service.";

// @ts-ignore
import ConsistentHash from "consistent-hash";
import { DiscoveryService } from "../discovery";
import { IQueueConsumerHandler, QUEUE_CUNSUMER_META } from "./consumer";
import { IQueueConsumerOptions, IQueuePayload } from "./queue.interface";

export interface IQueueCunsumerProvider {
  queueName: string;
  options?: IQueueConsumerOptions;
  handler: IQueueConsumerHandler;
}

@Injectable()
export class QueueRunnerService {
  private logger = new Logger(this.constructor.name);

  constructor(private readonly queueService: QueueService, private readonly discoveryService: DiscoveryService) {}

  // extract all queue consumer providers
  async extractConsumers(): Promise<IQueueCunsumerProvider[]> {
    const providers = await this.discoveryService.providersWithMetaAtKey(QUEUE_CUNSUMER_META);

    return providers.map((p) => {
      const queueName = _.get(p, "meta.queueName");
      const options = _.get(p, "meta.options");
      if (!queueName) {
        throw new InternalServerErrorException(`Missing queue name. Class ${p.discoveredClass.name}`);
      }
      const instance: any = p.discoveredClass.instance;
      // check if instance implements IQueueCunsumerHandler
      if (!instance.handle) {
        throw new InternalServerErrorException(`Missing handle method. Class ${p.discoveredClass.name}`);
      }

      return {
        queueName: queueName,
        options: options,
        // TODO: inject consumer handler instance from p
        handler: p.discoveredClass.instance as IQueueConsumerHandler,
      };
    });
  }

  // start all queue consumers
  async run() {
    this.logger.log("Starting queue consumers");
    // discover all queue consumer providers
    const consumers = await this.extractConsumers();

    this.logger.log(`Found ${consumers.length} queue consumers`);

    for (const c of consumers) {
      // check queue config matcher to see if this queue consumer should be run
      const matcher = WORKER_CONFIG.queue.matcher;
      if (matcher && matcher.length > 0) {
        const matched = matcher.some((m) => c.queueName.match(`^${m}$`));
        if (!matched) {
          this.logger.warn(`Queue ${c.queueName} is skipped.`);
          continue;
        }
      }
      // check if queue consumer is enabled consistent hashing
      if (c.options?.consistentHashing) {
        // handle local queue as a consistent hashing strategy
        const hr = new ConsistentHash({
          distribution: "uniform",
          weight: 40,
        });
        // init local queue to handle concurrency
        const localQueueMap: Record<string, Fastq.queueAsPromised<IQueuePayload, void>> = {};

        // Init local queue for each hash ring
        _.times(c.options?.concurrency || 1, (i) => {
          const nodeName = `${c.queueName}-${i}`;
          // add node to hash ring
          hr.add(nodeName);
          // init local queue
          localQueueMap[nodeName] = Fastq.promise(
            {},
            (payload: IQueuePayload) => {
              return c.handler.handle(payload);
            },
            1 // concurrency must be 1
          );
        });

        this.logger.debug(`Hash ring ${c.queueName} init with ${Object.keys(localQueueMap).length} nodes`);

        // consume queue
        await this.queueService.consume(
          c.queueName,
          (payload) => {
            const hashKey = payload.data[c.options?.consistentHashingKey || "id"];
            // get node nconsume errorame from consistent hashing
            const nodeName = hr.get(hashKey);
            // this.logger.debug(`Hash ${hashKey} push to node ${nodeName}`);
            payload.node = nodeName;
            // push payload to local queue
            return localQueueMap[nodeName].push(payload);
          },
          c.options
        );
      } else {
        // handle local queue as a round-robin strategy
        // init local queue to handle concurrency
        const localQueue = Fastq.promise(
          {},
          async (payload: IQueuePayload) => {
            return await c.handler.handle(payload);
          },
          c.options?.concurrency || 1
        );
        await this.queueService.consume(c.queueName, (payload) => localQueue.push(payload), c.options);
      }

      this.logger.log(`Queue ${c.queueName} is running`);
    }
  }
}
