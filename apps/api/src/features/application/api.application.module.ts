import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ApiApplicationResolver } from "./api.application.resolver";
import { CreateApplicationHandler } from "./commands";

const CommandHandlers = [CreateApplicationHandler];

@Module({
  imports: [CqrsModule],
  providers: [ApiApplicationResolver, ...CommandHandlers],
})
export class ApiApplicationModule {}
