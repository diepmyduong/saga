let fileTypeFromFile: typeof import("file-type").fileTypeFromFile;
let fileTypeFromBuffer: typeof import("file-type").fileTypeFromBuffer;
(async () => {
  const fileType = await (eval('import("file-type")') as Promise<typeof import("file-type")>);
  fileTypeFromFile = fileType.fileTypeFromFile;
  fileTypeFromBuffer = fileType.fileTypeFromBuffer;
})();

export { fileTypeFromFile, fileTypeFromBuffer };
