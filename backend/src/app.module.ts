import { Module } from '@nestjs/common';
import { IssuesModule } from './issues/issues.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [IssuesModule, StoresModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
