import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'types';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
  ) {}

  async createTweet(tweet: CreateTweetDto): Promise<ApiResponse> {
    const newTweet = this.tweetRepository.create(tweet);
    await this.tweetRepository.save(newTweet);

    return {
      message: 'Tweet created successfully',
      statusCode: 201,
      data: tweet,
    };
  }

  getTweets(): ApiResponse {
    return {
      message: 'sucess',
      statusCode: 200,
      data: 'filteredTweets',
    };
  }

  getTweetsByUserId(userId: number): ApiResponse {
    // const user = this.usersService.getUserById(userId).data;
    // const tweets = this.tweets.filter((tweet) => tweet.userId === userId);

    // // transformation
    // const response = tweets.map((tweet) => ({
    //   text: tweet.text,
    //   date: tweet.date,
    //   name: user.name,
    // }));

    return {
      message: 'sucess',
      statusCode: 200,
      data: 'response',
    };
  }
}
