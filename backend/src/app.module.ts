import { Module } from '@nestjs/common';
import { IssuesModule } from './issues/issues.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [IssuesModule, StoresModule, UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
