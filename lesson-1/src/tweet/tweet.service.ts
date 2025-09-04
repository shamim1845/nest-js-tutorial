import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse } from 'types';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
import { Hashtag } from 'src/hashtag/entities/hashtag.entity';
import { UpdateTweetDto } from './dto/update-tweet.dto';

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

      console.log({ existingNames });

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

  async updateTweet(tweet: UpdateTweetDto): Promise<ApiResponse> {
    //  1️⃣ Find the existing tweet
    const existingTweet = await this.tweetRepository.findOne({
      where: { id: tweet.id },
      relations: ['user'],
    });

    console.log(tweet);

    console.log(existingTweet);

    if (!existingTweet) {
      return {
        message: 'Tweet not found!',
        statusCode: 404,
        data: null,
      };
    }

    // 2️⃣ Handle hashtags
    let hashtags: Hashtag[] = [];
    if (tweet.hashtags && tweet.hashtags.length > 0) {
      // find existing hashtags
      const existing = await this.hashtagRepository.find({
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

    //  Find the user by userId
    // if userId is provided and different from the existing one in the tweet
    // Then fetch the user and set it to the tweet
    // if (tweet.userId && tweet.userId !== existingTweet.user.id) {
    //   const userResponse = await this.userService.getUserById(tweet.userId);
    //   const user = userResponse.data as User;

    //   if (!user) {
    //     return {
    //       message: 'User not found!',
    //       statusCode: 404,
    //       data: null,
    //     };
    //   }

    //   // Update the user in the tweet
    //   existingTweet.user = userResponse.data as User;
    // }

    //  3️⃣ Update the tweet
    // const updatedTweet = { ...existingTweet, ...tweet, hashtags };
    const updatedTweet = this.tweetRepository.merge(existingTweet, {
      text: tweet.text ?? existingTweet.text,
      image: tweet.image ?? existingTweet.image,
      hashtags: hashtags,
    });
    await this.tweetRepository.save(updatedTweet);

    return {
      message: 'Tweet updated successfully',
      statusCode: 200,
      data: updatedTweet,
    };
  }

  async deleteTweet(id: number): Promise<ApiResponse> {
    const existingTweet = await this.tweetRepository.findOne({
      where: { id },
    });

    if (!existingTweet) {
      return {
        message: 'Tweet not found!',
        statusCode: 404,
        data: null,
      };
    }

    await this.tweetRepository.remove(existingTweet);

    return {
      message: 'Tweet deleted successfully',
      statusCode: 200,
      data: existingTweet,
    };
  }

  async getTweets(): Promise<ApiResponse> {
    const tweets = await this.tweetRepository.find({
      relations: ['user', 'hashtags'],
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: tweets,
    };
  }

  async getTweetsByUserId(userId: number): Promise<ApiResponse> {
    //  Find the user by userId
    const userResponse = await this.userService.getUserById(userId);

    const user = userResponse.data as User;

    if (!user) {
      throw new NotFoundException(`User with userId ${userId} is not found!`);
    }

    // Find tweets by userId
    const tweets = await this.tweetRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'hashtags'],
    });

    if (tweets.length === 0) {
      throw new NotFoundException('No tweets found for this user');
    }

    return {
      message: 'sucess',
      statusCode: 200,
      data: tweets,
    };
  }
}
