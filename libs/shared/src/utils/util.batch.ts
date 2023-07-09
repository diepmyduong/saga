import { TypedEmitter } from "tiny-typed-emitter";

interface BatchAsyncEvent<T> {
  completed: () => void;
  feed: (item: T) => void;
  batch: (items: T[]) => void;
  error: (error: any) => void;
}

interface BatchAsyncOptions {
  batchSize?: number;
  debound?: number;
  parallel?: number;
}

export class BatchAsync<T> extends TypedEmitter<BatchAsyncEvent<T>> {
  stack: T[][] = [];
  batch: T[] = [];
  processing = 0;
  completed = false;

  private timeout: any;

  constructor(batchFn: (items: T[]) => Promise<any>, private options: BatchAsyncOptions = {}) {
    super();
    this.options = {
      batchSize: options.batchSize || 1000,
      debound: options.debound || 300,
      parallel: options.parallel || 1,
    };
    // parallet require more than 1
    if (this.options.parallel! < 1) {
      this.options.parallel = 1;
    }

    this.on("feed", (data) => {
      this.touch();
      this.batch.push(data);
      if (this.batch.length == this.options.batchSize) {
        this.emit("batch", this.batch);
        this.batch = [];
      }
    });
    this.on("batch", async (items: any[]) => {
      if (this.processing >= this.options.parallel!) {
        this.stack.push(items);
        return;
      }
      this.processing++;
      try {
        await batchFn(items);
      } catch (err) {
        this.emit("error", err);
      } finally {
        this.processing--;
        if (this.stack.length > 0) {
          this.emit("batch", this.stack.shift() as T[]);
        }
      }
    });

    this.on("completed", () => {
      if (this.timeout) clearTimeout(this.timeout);
    });
  }

  complete() {
    this.completed = true;
    if (this.stack.length == 0 && this.batch.length == 0 && this.processing == 0) {
      this.emit("completed");
    }
  }

  feed(item: T) {
    this.emit("feed", item);
  }

  private touch() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.processing < this.options.parallel! && this.batch.length > 0) {
        this.emit("batch", this.batch);
        this.batch = [];
      }
      if (this.processing == 0 && this.batch.length == 0 && this.completed && this.stack.length == 0) {
        this.emit("completed");
      } else {
        this.touch();
      }
    }, this.options.debound);
  }

  toPromise() {
    return new Promise<void>((resolve, reject) => {
      this.on("completed", resolve);
      this.on("error", reject);
    });
  }
}
