import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TweetService } from './tweet.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { GetTweetQueryDto } from './dto/get-tweet-query-dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

// http://localhost:8000/tweet
@Controller('tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService) { }

  @Get()
  getTweets(
    @Query() getTweetQueryDto: GetTweetQueryDto,
    @Query('test', new DefaultValuePipe(10), ParseIntPipe) test: number,
  ) {
    return this.tweetService.getTweets(getTweetQueryDto);
  }

  @Get(':userId')
  getTweetsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.tweetService.getTweetsByUserId(userId);
  }

  @Post()
  createTweet(
    @Body() tweet: CreateTweetDto,
    @ActiveUser('sub') userId: number,
  ) {
    console.log('UserID => ', userId);

    return this.tweetService.createTweet(tweet, userId);
  }

  @Patch()
  updateTweet(@Body() tweet: UpdateTweetDto) {
    return this.tweetService.updateTweet(tweet);
  }

  @Delete(':id')
  deleteTweet(@Param('id', ParseIntPipe) id: number) {
    return this.tweetService.deleteTweet(id);
  }
}
