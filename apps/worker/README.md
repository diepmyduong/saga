# Queue Worker

## Example consumer

```typescript
import { IQueuePayload, QueueConsumer, QueueConsumerHandler } from "@app/app-generic";
import { QUEUE_NAME } from "@app/shared";
import _ from "lodash";
import { setTimeout } from "timers/promises";

@QueueConsumer(QUEUE_NAME.TEST_SUMMARY, {
  concurrency: 30,
})
export class TestSummaryQueue extends QueueConsumerHandler {
  async handle(payload: IQueuePayload) {
    const { a, b, index, id } = payload.data;
    await setTimeout(_.random(100, 300));
    this.logger.debug(`a + b = ${a + b}, ${Date.now() - payload.iat}ms, user: ${id}, ${index}, node: ${payload.node}`);
    const randomFailed = _.random(0, 1, false) === 1;
    if (randomFailed) {
      throw new Error("test");
    }
    return { result: a + b };
  }
}
```
