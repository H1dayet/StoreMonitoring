import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

@Global()
@Module({
  imports: [UsersModule],
  providers: [AuthService, AuthGuard, AdminGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, AdminGuard],
})
export class AuthModule {}
