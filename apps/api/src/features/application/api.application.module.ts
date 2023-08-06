import { CoreJwtModule } from "@app/core";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { ApiApplicationResolver } from "./api.application.resolver";
import {
  CreateApplicationHandler,
  InviteApplicationUserHandler,
  JointApplicationHandler,
  RemoveApplicationUserHandler,
} from "./commands";

const CommandHandlers = [
  CreateApplicationHandler,
  InviteApplicationUserHandler,
  JointApplicationHandler,
  RemoveApplicationUserHandler,
];

@Module({
  imports: [CqrsModule, CoreJwtModule],
  providers: [...CommandHandlers, ApiApplicationResolver],
})
export class ApiApplicationModule {}
