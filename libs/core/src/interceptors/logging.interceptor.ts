import { getRequest } from "@app/shared";
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import * as RequestIP from "@supercharge/request-ip";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("Request");
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const resource = context.getClass().name;
    const handler = context.getHandler().name;
    const req = getRequest(context);

    const reqIp = RequestIP.getClientIp(req);
    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`${reqIp} - ${resource} ${handler} - ${Date.now() - now}ms`);
        },
        error: (err: Error) => {
          this.logger.error(`${reqIp} - ${resource} ${handler} - ${Date.now() - now}ms - ${err.message}`);
        },
      })
    );
  }
}
