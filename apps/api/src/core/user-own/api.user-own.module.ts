import { Module } from "@nestjs/common";
import { ApiUserOwnResolver } from "./api.user-own.resolver";
import { LogoutUserUsecase, UserGetMeUsecase } from "./usecases";

@Module({
  imports: [],
  providers: [ApiUserOwnResolver, LogoutUserUsecase, UserGetMeUsecase],
})
export class ApiUserOwnModule {}
