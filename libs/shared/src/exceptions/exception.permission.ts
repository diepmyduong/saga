import { HttpException, HttpStatus } from '@nestjs/common';

export class PermissionException extends HttpException {
  constructor() {
    super('Permission Deny', HttpStatus.NOT_ACCEPTABLE);
  }
}
