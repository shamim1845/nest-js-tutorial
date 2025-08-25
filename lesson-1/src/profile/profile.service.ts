import { ApiResponse } from './../../types.d';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dtos/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createProfile(profileDto: CreateProfileDto): Promise<ApiResponse> {
    const profile = this.profileRepository.create(profileDto);
    await this.profileRepository.save(profile);

    return {
      message: 'Profile created successfully',
      statusCode: 201,
      data: profile,
    };
  }

  async getProfiles(): Promise<ApiResponse> {
    const profiles = await this.profileRepository.find({
      relations: ['user'],
    });

    return {
      message: 'Success',
      statusCode: 200,
      data: profiles,
    };
  }

  async deleteProfile(id: number): Promise<ApiResponse> {
    const profile = await this.profileRepository.findOneBy({ id });

    if (!profile) {
      return {
        message: 'Profile not found!',
        statusCode: 404,
        data: null,
      };
    }

    const deleteResult = await this.profileRepository.delete({ id });
    if (!deleteResult.affected) {
      return {
        message: 'Failed to delete Profile!',
        statusCode: 500,
        data: null,
      };
    }

    return {
      message: 'Profile deleted successfully',
      statusCode: 200,
      data: deleteResult,
    };
  }
}
