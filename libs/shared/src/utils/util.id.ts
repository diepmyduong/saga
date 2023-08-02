import crypto from "crypto";

export class IdUtil {
  // genrate 12 char id
  static id12() {
    return crypto.randomBytes(6).toString("hex");
  }

  // generate 64 char id
  static id64() {
    return crypto.randomBytes(32).toString("hex");
  }

  // generate n char id
  static id(num: number) {
    return crypto.randomBytes(num / 2).toString("hex");
  }
}
