import { CoreJwtModule } from "@app/core";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ApiApplicationOwnResolver } from "./api.application-own.resolver";

import { ApiApplicationResolver } from "./api.application.resolver";
import { CreateApplicationHandler, InviteApplicationUserHandler, JointApplicationHandler } from "./commands";

const CommandHandlers = [CreateApplicationHandler, InviteApplicationUserHandler, JointApplicationHandler];

@Module({
  imports: [CqrsModule, CoreJwtModule],
  providers: [...CommandHandlers, ApiApplicationResolver, ApiApplicationOwnResolver],
})
export class ApiApplicationModule {}
