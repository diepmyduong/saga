import { HttpException, HttpStatus } from "@nestjs/common";

export class BaseException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, httpStatus);
  }
}
