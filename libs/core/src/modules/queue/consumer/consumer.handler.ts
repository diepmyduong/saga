import { Logger } from "@nestjs/common";
import { IQueuePayload } from "../queue.interface";

export interface IQueueConsumerHandler {
  handle(payload: IQueuePayload): Promise<void>;
}

export abstract class ConsumerHandler implements IQueueConsumerHandler {
  protected logger = new Logger(this.constructor.name);
  abstract handle(payload: IQueuePayload): Promise<any>;
}
