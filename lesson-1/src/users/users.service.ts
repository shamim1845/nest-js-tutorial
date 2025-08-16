import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ApiResponse, User } from 'types';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthService } from 'src/auth/auth.service';

const getRandomUsers = (length: number): User[] => {
  const users = Array.from({ length }, (_, i) => {
    const firstNames = [
      'Shamim',
      'Shakib',
      'Sohel',
      'Ahsan',
      'Nadia',
      'Sumaiya',
      'Hasan',
      'Rafi',
      'Tanvir',
      'Mitu',
      'Omar',
      'Sami',
      'Fahim',
      'Zara',
      'Arif',
      'Mim',
      'Mehedi',
      'Sajid',
      'Tania',
      'Nafisa',
    ];
    const genders = ['male', 'female'];

    const randomName =
      firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    const randomAge = Math.floor(Math.random() * (45 - 18 + 1)) + 18;
    const randomMaritalStatus = Math.random() < 0.4; // ~40% married

    const email = `${randomName.toLowerCase()}${i + 1}@example.com`;
    const password = 'P@ssword123'; // same for all users

    return {
      id: i + 1,
      name: randomName.toLowerCase(),
      age: randomAge,
      gender: randomGender,
      isMarried: randomMaritalStatus,
      email,
      password,
    };
  });

  return users;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  users: User[] = getRandomUsers(200);

  getUsers({
    name,
    age,
    page,
    limit,
  }: {
    name: string;
    age: number;
    page: number;
    limit: number;
  }): ApiResponse {
    if (!this.authService.isAuthenticated) {
      return {
        message: 'failed',
        statusCode: 400,
        error: 'You are not logged in!',
      };
    }

    let filteredUsers: User[] = JSON.parse(JSON.stringify(this.users));

    // filter by name
    if (name) {
      filteredUsers = filteredUsers.filter((user) => user.name === name);
    }

    // filter by age
    if (age) {
      filteredUsers = filteredUsers.filter((user) => user.age >= age);
    }

    // pagination
    if (page && limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = limit * page;

      filteredUsers = filteredUsers.slice(startIndex, endIndex);
    }

    return {
      message: 'sucess',
      statusCode: 200,
      data: filteredUsers,
    };
  }

  getUserById(id: number): ApiResponse {
    const user = this.users.find((user) => user.id === id);

    return {
      message: 'sucess',
      statusCode: 200,
      data: user,
    };
  }

  createUser(user: CreateUserDto): ApiResponse {
    let currentUser = { ...user } as User;

    if (!user.id) {
      delete user.id;

      currentUser = {
        id: this.users.length + 1,
        ...user,
      };
    }

    this.users.push(currentUser);

    return {
      message: 'sucess',
      statusCode: 201,
      data: currentUser,
    };
  }

  updateUser(id: number, userData: UpdateUserDto): ApiResponse {
    const currentUser = this.users.find((u) => u.id === id);

    if (!currentUser) {
      return {
        message: 'User not found!',
        statusCode: 400,
        data: null,
      };
    }

    const updatedUser = { ...currentUser, ...userData };

    this.users = this.users.map((u) => {
      if (u.id === id) {
        return updatedUser;
      }
      return u;
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: updatedUser,
    };
  }

  deleteUser(id: number): ApiResponse {
    const currentUser = this.users.find((u) => u.id === id);

    if (!currentUser) {
      return {
        message: 'User not found!',
        statusCode: 400,
        data: null,
      };
    }

    this.users = this.users.filter((u) => u.id !== id);

    return {
      message: 'sucess',
      statusCode: 200,
      data: currentUser,
    };
  }
}
