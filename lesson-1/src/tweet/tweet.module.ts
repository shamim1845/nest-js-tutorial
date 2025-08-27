import { Module } from '@nestjs/common';
import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { Hashtag } from 'src/hashtag/entities/hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Hashtag]), UsersModule],
  controllers: [TweetController],
  providers: [TweetService],
})
export class TweetModule {}
