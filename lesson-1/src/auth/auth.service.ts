import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ApiResponse } from 'types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  isAuthenticated: boolean = false;

  login({ email, password }: { email: string; password: string }): ApiResponse {
    const user = this.usersService.users.find(
      (user) => user.email === email && user.password === password,
    );

    if (!user) {
      return {
        message: 'failed',
        statusCode: 400,
        error: 'User not found!',
      };
    }

    this.isAuthenticated = true;
    return {
      message: 'sucess',
      statusCode: 200,
      data: { user, token: 'my_secret_token' },
    };
  }
}
