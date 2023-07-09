import { Module } from '@nestjs/common';
import { ApiAuthResolver } from './api.auth.resolver';
import { ApiRefreshTokenUsecase } from './usecases';
import { ApiLoginUserUsecase } from './usecases/api.login-user.usecase';

@Module({
  imports: [],
  providers: [ApiAuthResolver, ApiLoginUserUsecase, ApiRefreshTokenUsecase],
  exports: [],
})
export class ApiAuthModule {}
