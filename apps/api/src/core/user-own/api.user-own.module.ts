import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ApiUserOwnResolver } from "./api.user-own.resolver";
import { UserGetMeUsecase, UserUpdateProfileUsecase } from "./usecases";

@Module({
  imports: [CqrsModule],
  providers: [ApiUserOwnResolver, UserGetMeUsecase, UserUpdateProfileUsecase],
})
export class ApiUserOwnModule {}
