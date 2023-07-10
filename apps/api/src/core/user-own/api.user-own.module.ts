import { Module } from "@nestjs/common";
import { ApiUserOwnResolver } from "./api.user-own.resolver";
import { LogoutUserUsecase, UserGetMeUsecase, UserUpdateProfileUsecase } from "./usecases";

@Module({
  imports: [],
  providers: [ApiUserOwnResolver, LogoutUserUsecase, UserGetMeUsecase, UserUpdateProfileUsecase],
})
export class ApiUserOwnModule {}
