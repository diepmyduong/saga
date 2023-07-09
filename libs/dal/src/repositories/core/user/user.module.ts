import { Module } from "@nestjs/common";

import { UserModelProvider, UserRepository } from "./user.repository";

@Module({
  providers: [UserModelProvider, UserRepository],
  exports: [UserModelProvider, UserRepository],
})
export class UserModule {}
