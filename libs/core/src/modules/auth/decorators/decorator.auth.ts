import { getRequest } from "@app/shared";
import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { JwtPayload } from "../types";

export const PUBLIC_META = "isPublic";
export const Public = () => SetMetadata(PUBLIC_META, true);

// Get current user
export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const req = getRequest(context);
  return req.user as JwtPayload;
});

// Get App Id
export const AppId = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const req = getRequest(context);
  return req.headers["x-app-id"];
});
