import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'types';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';
import { Profile } from 'src/profile/profile.entity';
import { UserAlreadyExistsException } from 'src/CustomExceptions/user-already-exists.exception';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,

    private readonly paginationProvider: PaginationProvider,
  ) {}

  async getUsers({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<ApiResponse> {
    try {
      const users = await this.paginationProvider.paginateQuery({
        paginationQueryDto: { page, limit },
        repository: this.userRepository,
        relations: ['profile', 'tweets'],
      });

      return {
        message: 'sucess',
        statusCode: 200,
        data: users,
      };
    } catch (error) {
      console.log(error);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.code === 'ECONNREFUSED') {
        throw new RequestTimeoutException(
          'An error has occured. Please try again.',
          {
            description: 'Could not connect to database.',
          },
        );
      }

      throw new BadRequestException('Unknown error');
    }
  }

  async getUserById(id: number): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'tweets'],
    });

    if (!user) {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND, {
        cause: new Error(
          'The exception occured because a user with id ' +
            id +
            'was not found!',
        ),
      });
    }

    return {
      message: 'sucess',
      statusCode: 200,
      data: user,
    };
  }

  async createUser(userDto: CreateUserDto): Promise<ApiResponse> {
    try {
      // Check if a user with the same email or username already exists
      const userWithEmail = await this.userRepository.findOneBy([
        { email: userDto.email },
      ]);

      if (userWithEmail) {
        throw new UserAlreadyExistsException('email', userDto.email);
      }

      const userWithUserName = await this.userRepository.findOneBy([
        { username: userDto.username },
      ]);

      if (userWithUserName) {
        throw new UserAlreadyExistsException('username', userDto.username);
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
    } catch (error) {
      console.log('Err =>>>>: ', error);

      if (error?.code === 'ECONNREFUSED') {
        throw new RequestTimeoutException(
          'An error has occured. Please try again.',
          {
            description: 'Could not connect to database.',
          },
        );
      }

      throw error;
    }
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

  // Utility function
  async findUserByUserNameOrEmail({
    username,
    email,
  }: {
    username?: string;
    email?: string;
  }) {
    let user: User | null = null;

    try {
      user = await this.userRepository.findOne({
        where: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
      });
    } catch (error) {
      console.log(error);

      throw new RequestTimeoutException(error, {
        description: 'User with given username or email could not be found!',
      });
    }

    if (!user) {
      throw new UnauthorizedException('User does not exist!');
    }

    return user;
  }
}
