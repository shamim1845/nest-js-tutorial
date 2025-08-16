import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TweetService } from './tweet.service';

// http://localhost:8000/tweet
@Controller('tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Get()
  getTweets() {
    return this.tweetService.getTweets();
  }

  @Get(':id')
  getTweetsByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.tweetService.getTweetsByUserId(id);
  }
}
