import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PrivateModule } from './private/private.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, PrivateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
