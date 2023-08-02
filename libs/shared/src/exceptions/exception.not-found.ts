import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./exception.base";

export class NotFoundException extends BaseException {
  constructor(code: string, message?: string) {
    super(code, message || "Not Found", HttpStatus.NOT_FOUND);
  }
}
