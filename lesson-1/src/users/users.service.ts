import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'types';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUsers({
    name,
    age,
    page,
    limit,
  }: {
    name: string;
    age: number;
    page: number;
    limit: number;
  }): Promise<ApiResponse> {
    const users = await this.userRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...(name && { firstName: name }),
        ...(age && { age: age }),
      },
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: users,
    };
  }

  async getUserById(id: number): Promise<ApiResponse> {
    const user = await this.userRepository.findOneBy({ id });

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

  async createUser(user: CreateUserDto): Promise<ApiResponse> {
    console.log(user);

    const existing_user = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (existing_user) {
      return {
        message: 'User with this email already exists!',
        statusCode: 400,
        data: null,
      };
    }

    const newUser = this.userRepository.create(user);
    await this.userRepository.save(newUser);

    return {
      message: 'sucess',
      statusCode: 201,
      data: newUser,
    };
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<ApiResponse> {
    const existing_user = await this.userRepository.findOneBy({
      id,
    });

    if (!existing_user) {
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

  // deleteUser(id: number): ApiResponse {
  //   const currentUser = this.users.find((u) => u.id === id);

  //   if (!currentUser) {
  //     return {
  //       message: 'User not found!',
  //       statusCode: 400,
  //       data: null,
  //     };
  //   }

  //   this.users = this.users.filter((u) => u.id !== id);

  //   return {
  //     message: 'sucess',
  //     statusCode: 200,
  //     data: currentUser,
  //   };
  // }
}
