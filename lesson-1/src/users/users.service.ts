import { Injectable } from '@nestjs/common';
import { ApiResponse, User } from 'types';

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

    return {
      id: i + 1,
      name: randomName.toLowerCase(),
      age: randomAge,
      gender: randomGender,
      isMarried: randomMaritalStatus,
    };
  });

  return users;
};

@Injectable()
export class UsersService {
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
    console.log({
      name,
      age,
      page,
      limit,
    });

    return {
      message: 'sucess',
      statusCode: 200,
      data: this.users
        .filter((user) => (name ? user.name === name : user))
        .filter((user) => (age ? user.age >= age : user)),
      // .slice(page - 1 * 10, limit * page),
    };
  }

  getUserById(id: number): ApiResponse {
    return {
      message: 'sucess',
      statusCode: 200,
      data: this.users.find((user) => user.id === id),
    };
  }

  createUser(user: User): ApiResponse {
    const currentUser = {
      id: this.users.length + 1,
      ...{
        name: user?.name,
        age: user?.age,
        gender: user?.gender,
        isMarried: user?.isMarried,
      },
    };

    this.users.push(currentUser);

    return {
      message: 'sucess',
      statusCode: 201,
      data: currentUser,
    };
  }

  updateUser(id: number, userData: User): ApiResponse {
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
