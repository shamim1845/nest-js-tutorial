import { Injectable } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { ApiResponse } from 'types';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HashtagService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
  ) {}

  async create(createHashtagDto: CreateHashtagDto): Promise<ApiResponse> {
    // Check if the hashtag already exists
    const existingHashtag = await this.hashtagRepository.findOne({
      where: { name: createHashtagDto.name },
    });

    if (existingHashtag) {
      return {
        message: 'Hashtag already exists',
        statusCode: 400,
        data: null,
      };
    }

    // Create and save the new hashtag
    const newHashTag = this.hashtagRepository.create(createHashtagDto);
    await this.hashtagRepository.save(newHashTag);

    return {
      message: 'Hashtag created successfully',
      statusCode: 201,
      data: newHashTag,
    };
  }

  async findAll(): Promise<ApiResponse> {
    const hashtags = await this.hashtagRepository.find({});
    return {
      message: 'Success',
      statusCode: 200,
      data: hashtags,
    };
  }

  async findOne(id: number): Promise<ApiResponse> {
    // Find the hashtag by ID
    const hashtag = await this.hashtagRepository.findOne({ where: { id } });
    if (!hashtag) {
      return {
        message: 'Hashtag not found',
        statusCode: 404,
        data: null,
      };
    }

    return {
      message: 'Success',
      statusCode: 200,
      data: hashtag,
    };
  }

  async update(
    id: number,
    updateHashtagDto: UpdateHashtagDto,
  ): Promise<ApiResponse> {
    // Find the hashtag by ID
    const hashtag = await this.hashtagRepository.findOne({ where: { id } });

    if (!hashtag) {
      return {
        message: 'Hashtag not found',
        statusCode: 404,
        data: null,
      };
    }

    // Update the hashtag
    Object.assign(hashtag, updateHashtagDto);
    await this.hashtagRepository.save(hashtag);

    return {
      message: 'Hashtag updated successfully',
      statusCode: 200,
      data: hashtag,
    };
  }

  async remove(id: number): Promise<ApiResponse> {
    // Find the hashtag by ID
    const hashtag = await this.hashtagRepository.findOne({ where: { id } });
    if (!hashtag) {
      return {
        message: 'Hashtag not found',
        statusCode: 404,
        data: null,
      };
    }

    // Delete the hashtag
    const result = await this.hashtagRepository.softDelete({ id });
    if (!result) {
      return {
        message: 'Failed to delete hashtag',
        statusCode: 500,
        data: null,
      };
    }

    return {
      message: 'Hashtag deleted successfully',
      statusCode: 200,
      data: hashtag,
    };
  }
}
