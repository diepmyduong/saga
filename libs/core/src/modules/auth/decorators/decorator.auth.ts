import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const PUBLIC_META = "isPublic";
export const Public = () => SetMetadata(PUBLIC_META, true);

// Get current user
export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
