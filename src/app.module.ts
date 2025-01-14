import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrivateModule } from './private/private.module';

@Module({
  imports: [AuthModule, PrivateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
