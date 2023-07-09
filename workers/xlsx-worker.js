const { workerData, parentPort, isMainThread } = require("worker_threads");
const XLSXWriteStream = require("@atomictech/xlsx-write-stream").default;
const fs = require("fs");

if (isMainThread) {
  throw new Error("This file should be run as a worker thread");
}

const filePath = workerData.filePath;

if (!filePath) {
  throw new Error("No file path provided");
}

// setup the write stream
const xlsxWriter = new XLSXWriteStream();
const writeStream = fs.createWriteStream(filePath);

xlsxWriter.pipe(writeStream);
// listen for the close event
writeStream.on("finish", () => {
  // TODO: post main thread that the file is ready and close the worker
  parentPort.postMessage({ status: "finish" });
});
writeStream.on("error", (err) => {
  // TODO: post main thread that there was an error
  parentPort.postMessage({ status: "error", error: err });
});

const methods = {
  addRow: (row) => {
    xlsxWriter.write(row);
  },
  complete: () => {
    xlsxWriter.end();
  },
};

parentPort.on("message", (message) => {
  const { method, data } = message;
  if (methods[method]) {
    methods[method](data);
  }
});
