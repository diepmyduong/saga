import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./exception.base";

export class ForbiddenException extends BaseException {
  constructor(code: string, message?: string) {
    super(code, message || "Forbidden", HttpStatus.FORBIDDEN);
  }
}
