// Make a decorator for the consumer class

import { SetMetadata } from "@nestjs/common";
import { IQueueConsumerOptions } from "../queue.interface";

export const QUEUE_CUNSUMER_META = "queue:consumer";

export const QueueConsumer = (queueName: string, options?: IQueueConsumerOptions) => {
  return SetMetadata(QUEUE_CUNSUMER_META, {
    queueName,
    options,
  });
};
