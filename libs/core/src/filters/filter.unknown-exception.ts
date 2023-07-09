import { getResponse } from '@app/shared';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

@Catch()
export class UnknownExceptionFilter implements ExceptionFilter {
  private logger = new Logger(UnknownExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    // const ctx = host.switchToHttp();

    if (host instanceof ExecutionContextHost) {
      const response = getResponse(host);
      if (!response) return;

      this.logger.error('UnknownExceptionFilter', exception);

      //   response.status(500).json({
      //     statusCode: 500,
      //     message: 'Internal server error',
      //   });
    }
  }
}
