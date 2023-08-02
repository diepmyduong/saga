import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./exception.base";

export class DalException extends BaseException {
  constructor(message: string) {
    super("1000", message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
