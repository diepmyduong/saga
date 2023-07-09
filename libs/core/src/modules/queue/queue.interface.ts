import { Options } from "amqplib";

export interface IQueueService {
  emit(queue: string, payload: any, options?: Options.Publish): Promise<void>;
  command<T>(queue: string, payload: any, options?: Options.Publish): Promise<T>;
}

export interface IQueueConsumerOptions {
  concurrency?: number; // default 1
  noAck?: boolean; // default false
  prefetch?: number; // default 30
  consistentHashing?: boolean; // default false
  consistentHashingKey?: string; // default 'id'
}

export interface IQueuePayload {
  data: any;
  iat: number;
  node?: string;
}

export type IQueuePublishOptions = Options.Publish & {
  // number of attempts to retry when failed
  attempts?: number;
};
