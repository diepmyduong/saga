import { UserModule } from '@app/dal';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AuthScopeService } from './auth.scope.service';

@Module({
  imports: [UserModule, CacheModule.register({})],
  providers: [AuthScopeService],
  exports: [AuthScopeService],
})
export class AuthScopeModule {}
