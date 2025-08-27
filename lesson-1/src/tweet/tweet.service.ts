import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'types';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
import { Hashtag } from 'src/hashtag/entities/hashtag.entity';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,

    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,

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

    console.log(tweet);

    // 2️⃣ Handle hashtags
    let hashtags: Hashtag[] = [];
    if (tweet.hashtags && tweet.hashtags.length > 0) {
      // find existing hashtags
      const existing = await this.hashtagRepository.find({
        // where: tweet.hashtags.map((name) => ({ name })),
        where: {
          name: In(tweet.hashtags),
        },
      });

      const existingNames = existing.map((h) => h.name);

      // create new ones for missing names
      const newOnes = tweet.hashtags
        .filter((name) => !existingNames.includes(name))
        .map((name) => {
          const h = new Hashtag();
          h.name = name;
          return h;
        });

      hashtags = [...existing, ...newOnes];
    }

    console.log(hashtags);

    // Create and save the tweet
    const newTweet = this.tweetRepository.create({
      ...tweet,
      user,
      hashtags: hashtags,
    });

    console.log(newTweet);

    await this.tweetRepository.save(newTweet);

    return {
      message: 'Tweet created successfully',
      statusCode: 201,
      data: newTweet,
    };
  }

  async getTweets(): Promise<ApiResponse> {
    const tweets = await this.tweetRepository.find({
      relations: ['user', 'hashtag'],
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: tweets,
    };
  }

  async getTweetsByUserId(userId: number): Promise<ApiResponse> {
    const tweets = await this.tweetRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'hashtag'],
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: tweets,
    };
  }
}
