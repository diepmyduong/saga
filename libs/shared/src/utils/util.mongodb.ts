import { Cursor } from "mongoose";

export function waitForCursor(cursor: Cursor<any, any>) {
  return new Promise((resolve, reject) => {
    cursor.on("end", () => {
      cursor.close();
      resolve(true);
    });

    cursor.on("error", (err) => {
      reject(err);
    });
  });
}
