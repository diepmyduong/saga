import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./exception.base";

export class UnauthorizedException extends BaseException {
  constructor() {
    super("401", "UnauthorizedException", HttpStatus.UNAUTHORIZED);
  }
}
