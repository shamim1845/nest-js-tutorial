import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ApiResponse } from 'types';

@Injectable()
export class TweetService {
  constructor(private readonly usersService: UsersService) {}

  private tweets: { text: String; date: Date; userId: Number }[] = [
    { text: 'tweet 1', date: new Date('2025-7-22'), userId: 1 },
    { text: 'tweet 2', date: new Date('2025-6-26'), userId: 2 },
    { text: 'tweet 3', date: new Date('2025-5-28'), userId: 2 },
  ];

  getTweets(): ApiResponse {
    const filteredTweets = this.tweets;

    return {
      message: 'sucess',
      statusCode: 200,
      data: filteredTweets,
    };
  }

  getTweetsByUserId(userId: number): ApiResponse {
    const user = this.usersService.getUserById(userId).data;
    const tweets = this.tweets.filter((tweet) => tweet.userId === userId);

    // transformation
    const response = tweets.map((tweet) => ({
      text: tweet.text,
      date: tweet.date,
      name: user.name,
    }));

    return {
      message: 'sucess',
      statusCode: 200,
      data: response,
    };
  }
}
