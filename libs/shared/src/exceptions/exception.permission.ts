import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./exception.base";

export class PermissionException extends BaseException {
  constructor() {
    super("401", "Permission Deny", HttpStatus.NOT_ACCEPTABLE);
  }
}
