import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export function GqlGuard(guard: any) {
  @Injectable()
  class GqlGuardHost extends guard {
    getRequest(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
  }

  return GqlGuardHost;
}
