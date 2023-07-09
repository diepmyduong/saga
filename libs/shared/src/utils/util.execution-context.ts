import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";

export function getRequest(context: ExecutionContext) {
  let req = context.switchToHttp().getRequest();

  if (!req) {
    req = GqlExecutionContext.create(context).getContext().req;
  }
  if (!req) {
    req = context.switchToRpc().getContext().req;
  }
  if (!req) {
    req = context.switchToWs().getClient().handshake;
  }
  return req as Request;
}

export function getResponse(context: ExecutionContext) {
  const req = getRequest(context);
  return req?.res;
}
