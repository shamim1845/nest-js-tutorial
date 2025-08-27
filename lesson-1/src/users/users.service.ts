import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'types';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';
import { Profile } from 'src/profile/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getUsers({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<ApiResponse> {
    const users = await this.userRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['profile'],
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: users,
    };
  }

  async getUserById(id: number): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'tweets'],
    });

    if (!user) {
      return {
        message: 'User not found!',
        statusCode: 404,
        data: null,
      };
    }

    return {
      message: 'sucess',
      statusCode: 200,
      data: user,
    };
  }

  async createUser(userDto: CreateUserDto): Promise<ApiResponse> {
    // Check if a user with the same email or username already exists
    const user = await this.userRepository.findOneBy([
      { email: userDto.email },
      { username: userDto.username },
    ]);

    if (user) {
      return {
        message: 'User with this email or username already exists!',
        statusCode: 400,
        data: null,
      };
    }

    // Ensure profile is at least an empty object
    userDto.profile = (userDto?.profile as Partial<Profile>) ?? {};

    const newUser = this.userRepository.create(userDto);
    await this.userRepository.save(newUser);

    return {
      message: 'sucess',
      statusCode: 201,
      data: newUser,
    };
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<ApiResponse> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      return {
        message: 'User not found!',
        statusCode: 400,
        data: null,
      };
    }

    const updatedUser = await this.userRepository.update(id, userData);

    if (!updatedUser.affected) {
      return {
        message: 'Failed to update user!',
        statusCode: 500,
        data: null,
      };
    }

    return {
      message: 'sucess',
      statusCode: 200,
      data: updatedUser,
    };
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      return {
        message: 'User not found!',
        statusCode: 400,
        data: null,
      };
    }

    const deleteResult = await this.userRepository.delete(id);
    if (!deleteResult.affected) {
      return {
        message: 'Failed to delete user!',
        statusCode: 500,
        data: null,
      };
    }

    return {
      message: 'sucess',
      statusCode: 200,
      data: deleteResult,
    };
  }
}
