import { Module } from "@nestjs/common";
import { ApplicationModelProvider, ApplicationRepository } from "./application.repository";

@Module({
  providers: [ApplicationModelProvider, ApplicationRepository],
  exports: [ApplicationRepository],
})
export class ApplicationModule {}
