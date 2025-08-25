import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'types';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    private readonly userService: UsersService,
  ) {}

  async createTweet(tweet: CreateTweetDto): Promise<ApiResponse> {
    //  Find the user by userId
    const userResponse = await this.userService.getUserById(tweet.userId);

    const user = userResponse.data as User;

    if (!user) {
      return {
        message: 'User not found!',
        statusCode: 404,
        data: null,
      };
    }

    delete user.profile;

    // Create and save the tweet
    const newTweet = this.tweetRepository.create({
      ...tweet,
      user,
    });
    await this.tweetRepository.save(newTweet);

    return {
      message: 'Tweet created successfully',
      statusCode: 201,
      data: newTweet,
    };
  }

  async getTweets(): Promise<ApiResponse> {
    const tweets = await this.tweetRepository.find({ relations: ['user'] });

    return {
      message: 'sucess',
      statusCode: 200,
      data: tweets,
    };
  }

  async getTweetsByUserId(userId: number): Promise<ApiResponse> {
    const tweets = await this.tweetRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: tweets,
    };
  }
}
