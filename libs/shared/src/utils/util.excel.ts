import EventEmitter from "events";
import { Worker } from "worker_threads";

export class XLSXStreamWriterWorker {
  private _worker: Worker;
  private _eventEmitter: EventEmitter = new EventEmitter();

  constructor(filePath: string) {
    // intialize worker thread
    this.initWorker(filePath);

    // initialize events
    this.initEvents();
  }

  private initWorker(filePath: string) {
    this._worker = new Worker("./workers/xlsx-worker.js", {
      workerData: {
        filePath: filePath,
      },
    });
  }

  private initEvents() {
    this._worker.on("message", (message) => {
      if (message.status === "finish") {
        this._eventEmitter.emit("finish");
      }
    });

    this._worker.on("error", (error) => {
      this._eventEmitter.emit("error", error);
    });

    this._worker.on("exit", (code) => {
      if (code !== 0) {
        this._eventEmitter.emit("error", new Error(`Worker stopped with exit code ${code}`));
      } else {
        this._eventEmitter.emit("finish");
      }
    });
  }

  // method to wait for stream to finish
  waitForStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._eventEmitter.on("finish", () => {
        resolve();
      });
      this._eventEmitter.on("error", (error) => {
        reject(error);
      });
    });
  }

  // method to add rows to the stream
  addRow(row: Array<string | number>) {
    this._worker.postMessage({ method: "addRow", data: row });
  }

  // end worker thread with complete status
  end() {
    this._worker.postMessage({ method: "complete" });
  }

  // terminate worker thread
  destroy() {
    this._worker.terminate();
  }
}
