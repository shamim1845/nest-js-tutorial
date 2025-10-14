import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { TweetModule } from './tweet/tweet.module';
import { AuthModule } from './auth/auth.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { APP_GUARD } from '@nestjs/core';
import { AuthorizeGuard } from './auth/guards/authorize.guard';
import { authConfig } from './auth/config/auth.config';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat/chat.gateway';

const ENV = process.env.NODE_ENV;
const envFilePath = !ENV
  ? '.env'
  : `.env.${String(ENV).trim().toLocaleLowerCase()}`;

console.log({
  ENV,
  envFilePath,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      envFilePath: envFilePath,
      load: [appConfig, databaseConfig, authConfig], // Load the appConfig function to manage configurations
      validationSchema: envValidationSchema, // Validate environment variables
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // entities: [User, Profile],
        autoLoadEntities: configService.get<boolean>(
          'database.autoLoadEntities',
        ), // Automatically load entities
        synchronize: configService.get<boolean>('database.syncronize'), // Set to false in production

        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
      }),
    }),
    // ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
    UsersModule,
    TweetModule,
    HashtagModule,
    AuthModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthorizeGuard,
    // },
    ChatGateway,
  ],
})
export class AppModule {}
