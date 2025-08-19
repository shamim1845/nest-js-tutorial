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
    private profileRepository: Repository<Profile>,
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
}
