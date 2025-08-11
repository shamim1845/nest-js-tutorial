import { Injectable } from '@nestjs/common';

export type User = {
  id?: number;
  name: string;
  age: number;
  gender: string;
  isMarried: boolean;
};
@Injectable()
export class UsersService {
  users: User[] = [
    {
      id: 1,
      name: 'shamim',
      age: 25,
      gender: 'male',
      isMarried: false,
    },
    {
      id: 2,
      name: 'shakib',
      age: 24,
      gender: 'male',
      isMarried: false,
    },
    {
      id: 3,
      name: 'sohel',
      age: 27,
      gender: 'male',
      isMarried: false,
    },
    {
      id: 4,
      name: 'ahsan',
      age: 22,
      gender: 'male',
      isMarried: false,
    },
  ];

  getUsers({ name, age }: { name: string; age: string }): object {
    return {
      msg: 'sucess',
      status: 200,
      data: this.users
        .filter((user) => (name ? user.name === name : user))
        .filter((user) => (age ? user.age >= Number(age) : user)),
    };
  }

  getUserById(id: number): object {
    return {
      msg: 'sucess',
      status: 200,
      data: this.users.find((user) => user.id === id),
    };
  }

  createUser(user: User): object {
    const currentUser = { ...user, id: this.users.length + 1 };
    this.users.push(currentUser);

    return {
      msg: 'sucess',
      status: 201,
      data: currentUser,
    };
  }

  updateUser(id: number, userData: User) {
    const currentUser = this.users.find((u) => u.id === id);

    if (!currentUser) {
      return {
        msg: 'User not found!',
        status: 400,
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
      msg: 'sucess',
      status: 200,
      data: updatedUser,
    };
  }

  deleteUser(id: number) {
    const currentUser = this.users.find((u) => u.id === id);

    if (!currentUser) {
      return {
        msg: 'User not found!',
        status: 400,
        data: null,
      };
    }

    this.users = this.users.filter((u) => u.id !== id);

    return {
      msg: 'sucess',
      status: 200,
      data: currentUser,
    };
  }
}
